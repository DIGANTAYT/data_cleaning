import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prisma';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:7860';

export const uploadDataset = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const file = req.file;
    let { projectId } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Default to a general project if not provided
    if (!projectId) {
      let defaultProject = await prisma.project.findFirst({ where: { userId, name: 'Default Project' } });
      if (!defaultProject) {
        defaultProject = await prisma.project.create({
          data: { name: 'Default Project', userId }
        });
      }
      projectId = defaultProject.id;
    }

    const filePath = file.path;

    // Create the dataset record
    const dataset = await prisma.dataset.create({
      data: {
        name: file.originalname,
        projectId,
        filePath,
        status: 'UPLOADED'
      }
    });

    // Notify AI engine to profile the dataset asynchronously
    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${backendUrl}/${filePath}`;

    axios.post(`${AI_ENGINE_URL}/api/profile`, { datasetId: dataset.id, filePath: fileUrl })
      .then(async (aiResponse) => {
        const { rowCount, status } = aiResponse.data;
        await prisma.dataset.update({
          where: { id: dataset.id },
          data: {
            rowCount: rowCount || 0,
            status: status === 'READY' ? 'READY' : 'FAILED'
          }
        });
        console.log(`Successfully profiled dataset ${dataset.id}: ${rowCount} rows.`);
      })
      .catch(async (err: any) => {
        console.error('Failed to trigger AI engine profiling:', err.message);
        await prisma.dataset.update({
          where: { id: dataset.id },
          data: { status: 'FAILED' }
        });
      });

    res.status(201).json({ message: 'Dataset uploaded successfully', dataset });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload dataset' });
  }
};

export const getDatasets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const datasets = await prisma.dataset.findMany({
      where: { project: { userId } },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(datasets);
  } catch (error: any) {
    console.error('Fetch datasets error:', error);
    res.status(500).json({ error: 'Failed to fetch datasets' });
  }
};

export const detectIssues = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const dataset = await prisma.dataset.findUnique({
      where: { id },
      include: { versions: { orderBy: { version: 'desc' } } }
    });
    
    if (!dataset) {
      res.status(404).json({ error: 'Dataset not found' });
      return;
    }

    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${backendUrl}/${dataset.filePath}`;

    const aiResponse = await axios.post(`${AI_ENGINE_URL}/api/detect-issues`, {
      filePath: fileUrl
    });
    
    res.status(200).json({
      ...aiResponse.data,
      versions: dataset.versions
    });
  } catch (error: any) {
    console.error('Detect issues error:', error.message);
    res.status(500).json({ error: 'Failed to detect issues' });
  }
};

export const cleanDataset = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { operations } = req.body;
    
    const dataset = await prisma.dataset.findUnique({ where: { id } });
    if (!dataset) {
      res.status(404).json({ error: 'Dataset not found' });
      return;
    }

    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${backendUrl}/${dataset.filePath}`;

    const aiResponse = await axios.post(`${AI_ENGINE_URL}/api/clean`, {
      datasetId: id,
      filePath: fileUrl,
      operations
    });
    
    const { rowCount, records, columns } = aiResponse.data;
    
    // Save the cleaned file locally on the Express backend!
    const newFileName = `cleaned_${Date.now()}-${path.basename(dataset.filePath)}`;
    const newFilePath = `uploads/${newFileName}`;
    const absolutePath = path.resolve(newFilePath);
    
    // Convert records back to CSV
    let fileContent = '';
    if (records && records.length > 0) {
      const headers = Object.keys(records[0]);
      fileContent += headers.join(',') + '\n';
      records.forEach((row: any) => {
        const line = headers.map(header => {
          let cell = row[header];
          if (cell === null || cell === undefined) cell = '';
          // Escape quotes
          cell = cell.toString().replace(/"/g, '""');
          if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(',');
        fileContent += line + '\n';
      });
    } else {
      fileContent = columns.join(',');
    }
    
    fs.writeFileSync(absolutePath, fileContent);
    
    // Create new DatasetVersion inside the Express backend database!
    const lastVersion = await prisma.datasetVersion.findFirst({
      where: { datasetId: id },
      orderBy: { version: 'desc' }
    });
    const nextVersion = lastVersion ? lastVersion.version + 1 : 1;
    
    const versionRecord = await prisma.datasetVersion.create({
      data: {
        datasetId: id,
        version: nextVersion,
        filePath: newFilePath,
        changes: JSON.stringify(operations)
      }
    });
    
    // Update main dataset record to point to the new file and row count
    const updatedDataset = await prisma.dataset.update({
      where: { id },
      data: {
        filePath: newFilePath,
        rowCount
      }
    });
    
    res.status(200).json({
      message: 'Dataset cleaned successfully',
      newFilePath,
      rowCount,
      dataset: updatedDataset,
      version: versionRecord
    });
  } catch (error: any) {
    console.error('Clean dataset error:', error.message);
    res.status(500).json({ error: 'Failed to clean dataset' });
  }
};

export const askCopilot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { query, apiKey } = req.body;
    
    const dataset = await prisma.dataset.findUnique({ where: { id } });
    if (!dataset) {
      res.status(404).json({ error: 'Dataset not found' });
      return;
    }

    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${backendUrl}/${dataset.filePath}`;

    const aiResponse = await axios.post(`${AI_ENGINE_URL}/api/copilot`, {
      filePath: fileUrl,
      query,
      apiKey
    });
    
    res.status(200).json(aiResponse.data);
  } catch (error: any) {
    console.error('Copilot error:', error.message);
    res.status(500).json({ error: 'Failed to process copilot query' });
  }
};

export const trainModel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { targetColumn } = req.body;
    
    const dataset = await prisma.dataset.findUnique({ where: { id } });
    if (!dataset) {
      res.status(404).json({ error: 'Dataset not found' });
      return;
    }

    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${backendUrl}/${dataset.filePath}`;

    const aiResponse = await axios.post(`${AI_ENGINE_URL}/api/train`, {
      filePath: fileUrl,
      targetColumn
    });
    
    res.status(200).json(aiResponse.data);
  } catch (error: any) {
    console.error('Train model error:', error.message);
    res.status(500).json({ error: 'Failed to train machine learning model' });
  }
};

export const downloadDataset = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { versionId } = req.query;

    const dataset = await prisma.dataset.findUnique({ where: { id } });
    if (!dataset) {
      res.status(404).json({ error: 'Dataset not found' });
      return;
    }

    let downloadPath = dataset.filePath;
    let downloadName = dataset.name;

    if (versionId) {
      const versionIdStr = Array.isArray(versionId) ? versionId[0] : versionId;
      const version = await prisma.datasetVersion.findFirst({
        where: { id: versionIdStr, datasetId: id as string }
      });
      if (version) {
        downloadPath = version.filePath;
        downloadName = `v${version.version}_${dataset.name}`;
      }
    }

    const absolutePath = path.resolve(__dirname, '../../', downloadPath);
    if (!fs.existsSync(absolutePath)) {
      res.status(404).json({ error: 'File not found on server' });
      return;
    }

    res.download(absolutePath, downloadName);
  } catch (error: any) {
    console.error('Download error:', error.message);
    res.status(500).json({ error: 'Failed to download dataset' });
  }
};
