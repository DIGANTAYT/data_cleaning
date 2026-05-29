import dotenv from 'dotenv';
dotenv.config();

// Programmatically bypass Prisma TLS self-signed certificate chain validation
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('sslaccept=')) {
  const separator = process.env.DATABASE_URL.includes('?') ? '&' : '?';
  process.env.DATABASE_URL = `${process.env.DATABASE_URL}${separator}sslaccept=accept_invalid_certs`;
}

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
