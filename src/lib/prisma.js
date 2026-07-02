import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global;

function createPrismaClient() {
  // During Vercel build step, environment variables might not be available.
  // We provide a dummy string to prevent PrismaPg from crashing during static analysis.
  const connectionString = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
