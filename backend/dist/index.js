"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Programmatically bypass Prisma TLS self-signed certificate chain validation
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('sslaccept=')) {
    const separator = process.env.DATABASE_URL.includes('?') ? '&' : '?';
    process.env.DATABASE_URL = `${process.env.DATABASE_URL}${separator}sslaccept=accept_invalid_certs`;
}
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const dataset_routes_1 = __importDefault(require("./routes/dataset.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/datasets', dataset_routes_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'backend' });
});
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
