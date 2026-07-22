import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// On Vercel serverless, we need to use /tmp which is writable
// On local dev, use the file path from .env
const dbPath = process.env.NODE_ENV === 'production'
  ? 'file:/tmp/kmh-erp.db'
  : process.env.DATABASE_URL || 'file:./db/custom.db'

// Override DATABASE_URL at runtime for Prisma
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.includes('/tmp')) {
  process.env.DATABASE_URL = dbPath
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
