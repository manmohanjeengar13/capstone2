import winston from 'winston';
import path from 'path';
import fs from 'fs';

const { combine, timestamp, printf, json, errors } = winston.format;

const logsDir = path.join(process.cwd(), 'logs');
try { if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true }); } catch {}

const REDACTED = new Set([
  'githubToken', 'sessionToken', 'password', 'encryptedToken',
  'accessToken', 'refreshToken', 'secret',
]);

const redactFormat = winston.format((info) => {
  const redact = (obj: Record<string, unknown>): Record<string, unknown> => {
    const r: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      r[k] = REDACTED.has(k)
        ? '[REDACTED]'
        : v && typeof v === 'object' && !Array.isArray(v)
          ? redact(v as Record<string, unknown>)
          : v;
    }
    return r;
  };
  return redact(info as unknown as Record<string, unknown>) as typeof info;
});

// Level indicators without relying on the `colors` package, which conflicts
// with winston's peer dependency on Node 22.
const LEVEL_PREFIX: Record<string, string> = {
  error: 'ERR',
  warn:  'WRN',
  info:  'INF',
  http:  'HTT',
  debug: 'DBG',
};

const devFormat = combine(
  redactFormat(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, requestId, userId, jobId, stack, ...rest }) => {
    const prefix = LEVEL_PREFIX[level] ?? level.toUpperCase().slice(0, 3);
    let line = `${ts} [${prefix}]`;
    if (requestId) line += ` [req:${String(requestId).slice(0, 8)}]`;
    if (userId)    line += ` [u:${String(userId).slice(0, 8)}]`;
    if (jobId)     line += ` [j:${String(jobId).slice(0, 8)}]`;
    line += ` ${message}`;
    const extra = Object.keys(rest).filter(k => k !== 'level');
    if (extra.length > 0) {
      try { line += ` ${JSON.stringify(Object.fromEntries(extra.map(k => [k, rest[k]])))}` } catch {}
    }
    if (stack) line += `\n${stack}`;
    return line;
  }),
);

const prodFormat = combine(redactFormat(), timestamp(), errors({ stack: true }), json());

const isProd = process.env.NODE_ENV === 'production';

const transports: winston.transport[] = [
  new winston.transports.Console({ format: isProd ? prodFormat : devFormat }),
];

try {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: prodFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      format: prodFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
    }),
  );
} catch {}

export const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  transports,
  exitOnError: false,
});

export function createRequestLogger(requestId: string, userId?: string) {
  return logger.child({ requestId, userId });
}