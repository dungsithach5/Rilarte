// Import PrismaClient from server
const { PrismaClient } = require('../../server/node_modules/@prisma/client');

const globalForPrisma = global as unknown as { prisma: any };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
