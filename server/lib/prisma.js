const { PrismaClient } = require('@prisma/client');

// Tạo Prisma client singleton để tránh connection conflicts
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Trong development, tạo instance mới mỗi lần để tránh hot reload issues
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

module.exports = prisma; 