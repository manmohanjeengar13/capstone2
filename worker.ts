import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { startWorker } from '@/queue/analysis.worker';
import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

function validateEnv(): void {
  const required = ['DATABASE_URL','REDIS_URL','ENCRYPTION_KEY','BETTER_AUTH_SECRET'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0) { logger.error(`Missing env vars: ${missing.join(', ')}`); process.exit(1); }
}

async function bootstrap(): Promise<void> {
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  validateEnv();
  logger.info('Worker bootstrapping...');
  try { await redis.connect(); logger.info('Redis connected'); } catch (e) { logger.error('Redis failed', { error: e instanceof Error ? e.message : String(e) }); process.exit(1); }
  try { await prisma.$connect(); logger.info('Database connected'); } catch (e) { logger.error('DB failed', { error: e instanceof Error ? e.message : String(e) }); process.exit(1); }
  startWorker();
  logger.info('Worker running — waiting for jobs');
}

process.on('SIGTERM', async () => { await prisma.$disconnect(); await redis.quit(); process.exit(0); });
process.on('SIGINT', async () => { await prisma.$disconnect(); await redis.quit(); process.exit(0); });
process.on('uncaughtException', (e) => { logger.error('Uncaught exception', { error: e.message }); process.exit(1); });

bootstrap().catch((err: Error) => { logger.error('Bootstrap failed', { error: err.message }); process.exit(1); });
