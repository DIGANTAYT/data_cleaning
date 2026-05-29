"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Programmatically bypass Prisma TLS self-signed certificate chain validation
if (process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.includes('sslmode=require')) {
        process.env.DATABASE_URL = process.env.DATABASE_URL.replace('sslmode=require', 'sslmode=no-verify');
    }
    else if (!process.env.DATABASE_URL.includes('sslmode=')) {
        const separator = process.env.DATABASE_URL.includes('?') ? '&' : '?';
        process.env.DATABASE_URL = `${process.env.DATABASE_URL}${separator}sslmode=no-verify`;
    }
    if (!process.env.DATABASE_URL.includes('sslaccept=')) {
        const separator = process.env.DATABASE_URL.includes('?') ? '&' : '?';
        process.env.DATABASE_URL = `${process.env.DATABASE_URL}${separator}sslaccept=accept_invalid_certs`;
    }
}
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
exports.default = prisma;
