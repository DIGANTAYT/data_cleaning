import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prisma';

export const getDashboards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const dashboards = await prisma.dashboard.findMany({
      where: { project: { userId } },
      orderBy: { updatedAt: 'desc' }
    });

    res.status(200).json(dashboards);
  } catch (error: any) {
    console.error('Fetch dashboards error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboards' });
  }
};

export const getDashboardById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const dashboard = await prisma.dashboard.findFirst({
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
  } catch (error: any) {
    console.error('Get dashboard by ID error:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard details' });
  }
};

export const createDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
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
      let defaultProject = await prisma.project.findFirst({ where: { userId, name: 'Default Project' } });
      if (!defaultProject) {
        defaultProject = await prisma.project.create({
          data: { name: 'Default Project', userId }
        });
      }
      projectId = defaultProject.id;
    }

    const dashboard = await prisma.dashboard.create({
      data: {
        name,
        projectId,
        config: typeof config === 'string' ? config : JSON.stringify(config || {})
      }
    });

    res.status(201).json({ message: 'Dashboard created successfully', dashboard });
  } catch (error: any) {
    console.error('Create dashboard error:', error);
    res.status(500).json({ error: 'Failed to create dashboard' });
  }
};

export const updateDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;
    const { name, config } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify ownership
    const existing = await prisma.dashboard.findFirst({
      where: { id, project: { userId } }
    });

    if (!existing) {
      res.status(404).json({ error: 'Dashboard not found or unauthorized' });
      return;
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (config !== undefined) {
      updateData.config = typeof config === 'string' ? config : JSON.stringify(config);
    }

    const updated = await prisma.dashboard.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ message: 'Dashboard updated successfully', dashboard: updated });
  } catch (error: any) {
    console.error('Update dashboard error:', error);
    res.status(500).json({ error: 'Failed to update dashboard' });
  }
};

export const deleteDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify ownership
    const existing = await prisma.dashboard.findFirst({
      where: { id, project: { userId } }
    });

    if (!existing) {
      res.status(404).json({ error: 'Dashboard not found or unauthorized' });
      return;
    }

    await prisma.dashboard.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Dashboard deleted successfully' });
  } catch (error: any) {
    console.error('Delete dashboard error:', error);
    res.status(500).json({ error: 'Failed to delete dashboard' });
  }
};
