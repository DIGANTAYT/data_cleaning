import { Router } from 'express';
import multer from 'multer';
import { uploadDataset, getDatasets, detectIssues, cleanDataset, askCopilot, trainModel, downloadDataset } from '../controllers/dataset.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
// Limit file size to 50 MiB and ensure the uploads folder exists
import fs from 'fs';
import path from 'path';
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MiB
});

router.get('/', authenticate, getDatasets as any);
router.post('/upload', authenticate, upload.single('file'), uploadDataset as any);
router.get('/:id/detect-issues', authenticate, detectIssues as any);
router.post('/:id/clean', authenticate, cleanDataset as any);
router.post('/:id/copilot', authenticate, askCopilot as any);
router.post('/:id/train', authenticate, trainModel as any);
router.get('/:id/download', authenticate, downloadDataset as any);

export default router;
