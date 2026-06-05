"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDashboard = exports.updateDashboard = exports.createDashboard = exports.getDashboardById = exports.getDashboards = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getDashboards = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const dashboards = await prisma_1.default.dashboard.findMany({
            where: { project: { userId } },
            orderBy: { updatedAt: 'desc' }
        });
        res.status(200).json(dashboards);
    }
    catch (error) {
        console.error('Fetch dashboards error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboards' });
    }
};
exports.getDashboards = getDashboards;
const getDashboardById = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const dashboard = await prisma_1.default.dashboard.findFirst({
            where: {
                id,
                project: { userId }
            }
        });
        if (!dashboard) {
            res.status(404).json({ error: 'Dashboard not found' });
            return;
        }
        res.status(200).json(dashboard);
    }
    catch (error) {
        console.error('Get dashboard by ID error:', error);
        res.status(500).json({ error: 'Failed to retrieve dashboard details' });
    }
};
exports.getDashboardById = getDashboardById;
const createDashboard = async (req, res) => {
    try {
        const userId = req.userId;
        let { name, projectId, config } = req.body;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!name) {
            res.status(400).json({ error: 'Dashboard name is required' });
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
        const dashboard = await prisma_1.default.dashboard.create({
            data: {
                name,
                projectId,
                config: typeof config === 'string' ? config : JSON.stringify(config || {})
            }
        });
        res.status(201).json({ message: 'Dashboard created successfully', dashboard });
    }
    catch (error) {
        console.error('Create dashboard error:', error);
        res.status(500).json({ error: 'Failed to create dashboard' });
    }
};
exports.createDashboard = createDashboard;
const updateDashboard = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;
        const { name, config } = req.body;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Verify ownership
        const existing = await prisma_1.default.dashboard.findFirst({
            where: { id, project: { userId } }
        });
        if (!existing) {
            res.status(404).json({ error: 'Dashboard not found or unauthorized' });
            return;
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (config !== undefined) {
            updateData.config = typeof config === 'string' ? config : JSON.stringify(config);
        }
        const updated = await prisma_1.default.dashboard.update({
            where: { id },
            data: updateData
        });
        res.status(200).json({ message: 'Dashboard updated successfully', dashboard: updated });
    }
    catch (error) {
        console.error('Update dashboard error:', error);
        res.status(500).json({ error: 'Failed to update dashboard' });
    }
};
exports.updateDashboard = updateDashboard;
const deleteDashboard = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Verify ownership
        const existing = await prisma_1.default.dashboard.findFirst({
            where: { id, project: { userId } }
        });
        if (!existing) {
            res.status(404).json({ error: 'Dashboard not found or unauthorized' });
            return;
        }
        await prisma_1.default.dashboard.delete({
            where: { id }
        });
        res.status(200).json({ message: 'Dashboard deleted successfully' });
    }
    catch (error) {
        console.error('Delete dashboard error:', error);
        res.status(500).json({ error: 'Failed to delete dashboard' });
    }
};
exports.deleteDashboard = deleteDashboard;
