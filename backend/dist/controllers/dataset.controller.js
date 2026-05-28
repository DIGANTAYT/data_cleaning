"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadDataset = exports.trainModel = exports.askCopilot = exports.cleanDataset = exports.detectIssues = exports.getDatasets = exports.uploadDataset = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uploadDataset = async (req, res) => {
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
            let defaultProject = await prisma_1.default.project.findFirst({ where: { userId, name: 'Default Project' } });
            if (!defaultProject) {
                defaultProject = await prisma_1.default.project.create({
                    data: { name: 'Default Project', userId }
                });
            }
            projectId = defaultProject.id;
        }
        const filePath = file.path;
        // Create the dataset record
        const dataset = await prisma_1.default.dataset.create({
            data: {
                name: file.originalname,
                projectId,
                filePath,
                status: 'UPLOADED'
            }
        });
        // Notify AI engine to profile the dataset asynchronously
        axios_1.default.post('http://localhost:8000/api/profile', { datasetId: dataset.id, filePath })
            .catch((err) => console.error('Failed to trigger AI engine profiling:', err.message));
        res.status(201).json({ message: 'Dataset uploaded successfully', dataset });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload dataset' });
    }
};
exports.uploadDataset = uploadDataset;
const getDatasets = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const datasets = await prisma_1.default.dataset.findMany({
            where: { project: { userId } },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(datasets);
    }
    catch (error) {
        console.error('Fetch datasets error:', error);
        res.status(500).json({ error: 'Failed to fetch datasets' });
    }
};
exports.getDatasets = getDatasets;
const detectIssues = async (req, res) => {
    try {
        const { id } = req.params;
        const dataset = await prisma_1.default.dataset.findUnique({
            where: { id: id },
            include: { versions: { orderBy: { version: 'desc' } } }
        });
        if (!dataset) {
            res.status(404).json({ error: 'Dataset not found' });
            return;
        }
        const aiResponse = await axios_1.default.post('http://localhost:8000/api/detect-issues', {
            filePath: dataset.filePath
        });
        res.status(200).json({
            ...aiResponse.data,
            versions: dataset.versions
        });
    }
    catch (error) {
        console.error('Detect issues error:', error.message);
        res.status(500).json({ error: 'Failed to detect issues' });
    }
};
exports.detectIssues = detectIssues;
const cleanDataset = async (req, res) => {
    try {
        const { id } = req.params;
        const { operations } = req.body;
        const dataset = await prisma_1.default.dataset.findUnique({ where: { id: id } });
        if (!dataset) {
            res.status(404).json({ error: 'Dataset not found' });
            return;
        }
        const aiResponse = await axios_1.default.post('http://localhost:8000/api/clean', {
            datasetId: id,
            filePath: dataset.filePath,
            operations
        });
        res.status(200).json(aiResponse.data);
    }
    catch (error) {
        console.error('Clean dataset error:', error.message);
        res.status(500).json({ error: 'Failed to clean dataset' });
    }
};
exports.cleanDataset = cleanDataset;
const askCopilot = async (req, res) => {
    try {
        const { id } = req.params;
        const { query, apiKey } = req.body;
        const dataset = await prisma_1.default.dataset.findUnique({ where: { id: id } });
        if (!dataset) {
            res.status(404).json({ error: 'Dataset not found' });
            return;
        }
        const aiResponse = await axios_1.default.post('http://localhost:8000/api/copilot', {
            filePath: dataset.filePath,
            query,
            apiKey
        });
        res.status(200).json(aiResponse.data);
    }
    catch (error) {
        console.error('Copilot error:', error.message);
        res.status(500).json({ error: 'Failed to process copilot query' });
    }
};
exports.askCopilot = askCopilot;
const trainModel = async (req, res) => {
    try {
        const { id } = req.params;
        const { targetColumn } = req.body;
        const dataset = await prisma_1.default.dataset.findUnique({ where: { id: id } });
        if (!dataset) {
            res.status(404).json({ error: 'Dataset not found' });
            return;
        }
        const aiResponse = await axios_1.default.post('http://localhost:8000/api/train', {
            filePath: dataset.filePath,
            targetColumn
        });
        res.status(200).json(aiResponse.data);
    }
    catch (error) {
        console.error('Train model error:', error.message);
        res.status(500).json({ error: 'Failed to train machine learning model' });
    }
};
exports.trainModel = trainModel;
const downloadDataset = async (req, res) => {
    try {
        const { id } = req.params;
        const { versionId } = req.query;
        const dataset = await prisma_1.default.dataset.findUnique({ where: { id: id } });
        if (!dataset) {
            res.status(404).json({ error: 'Dataset not found' });
            return;
        }
        let downloadPath = dataset.filePath;
        let downloadName = dataset.name;
        if (versionId) {
            const versionIdStr = Array.isArray(versionId) ? versionId[0] : versionId;
            const version = await prisma_1.default.datasetVersion.findFirst({
                where: { id: versionIdStr, datasetId: id }
            });
            if (version) {
                downloadPath = version.filePath;
                downloadName = `v${version.version}_${dataset.name}`;
            }
        }
        const absolutePath = path_1.default.resolve(__dirname, '../../', downloadPath);
        if (!fs_1.default.existsSync(absolutePath)) {
            res.status(404).json({ error: 'File not found on server' });
            return;
        }
        res.download(absolutePath, downloadName);
    }
    catch (error) {
        console.error('Download error:', error.message);
        res.status(500).json({ error: 'Failed to download dataset' });
    }
};
exports.downloadDataset = downloadDataset;
