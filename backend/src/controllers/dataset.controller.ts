import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prisma';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

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
    axios.post('http://localhost:8000/api/profile', { datasetId: dataset.id, filePath })
      .catch((err: any) => console.error('Failed to trigger AI engine profiling:', err.message));

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
    const { id } = req.params;
    const dataset = await prisma.dataset.findUnique({
      where: { id: id as string },
      include: { versions: { orderBy: { version: 'desc' } } }
    });
    
    if (!dataset) {
      res.status(404).json({ error: 'Dataset not found' });
      return;
    }

    const aiResponse = await axios.post('http://localhost:8000/api/detect-issues', {
      filePath: dataset.filePath
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
    const { id } = req.params;
    const { operations } = req.body;
    
    const dataset = await prisma.dataset.findUnique({ where: { id: id as string } });
    if (!dataset) {
      res.status(404).json({ error: 'Dataset not found' });
      return;
    }

    const aiResponse = await axios.post('http://localhost:8000/api/clean', {
      datasetId: id,
      filePath: dataset.filePath,
      operations
    });
    
    res.status(200).json(aiResponse.data);
  } catch (error: any) {
    console.error('Clean dataset error:', error.message);
    res.status(500).json({ error: 'Failed to clean dataset' });
  }
};

export const askCopilot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { query, apiKey } = req.body;
    
    const dataset = await prisma.dataset.findUnique({ where: { id: id as string } });
    if (!dataset) {
      res.status(404).json({ error: 'Dataset not found' });
      return;
    }

    const aiResponse = await axios.post('http://localhost:8000/api/copilot', {
      filePath: dataset.filePath,
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
    const { id } = req.params;
    const { targetColumn } = req.body;
    
    const dataset = await prisma.dataset.findUnique({ where: { id: id as string } });
    if (!dataset) {
      res.status(404).json({ error: 'Dataset not found' });
      return;
    }

    const aiResponse = await axios.post('http://localhost:8000/api/train', {
      filePath: dataset.filePath,
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
    const { id } = req.params;
    const { versionId } = req.query;

    const dataset = await prisma.dataset.findUnique({ where: { id: id as string } });
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
