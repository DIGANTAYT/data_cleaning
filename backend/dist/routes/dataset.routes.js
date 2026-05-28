"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const dataset_controller_1 = require("../controllers/dataset.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
// Limit file size to 50 MiB and ensure the uploads folder exists
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uploadsDir = path_1.default.resolve('uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MiB
});
router.get('/', auth_middleware_1.authenticate, dataset_controller_1.getDatasets);
router.post('/upload', auth_middleware_1.authenticate, upload.single('file'), dataset_controller_1.uploadDataset);
router.get('/:id/detect-issues', auth_middleware_1.authenticate, dataset_controller_1.detectIssues);
router.post('/:id/clean', auth_middleware_1.authenticate, dataset_controller_1.cleanDataset);
router.post('/:id/copilot', auth_middleware_1.authenticate, dataset_controller_1.askCopilot);
router.post('/:id/train', auth_middleware_1.authenticate, dataset_controller_1.trainModel);
router.get('/:id/download', auth_middleware_1.authenticate, dataset_controller_1.downloadDataset);
exports.default = router;
