import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logDirectory = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `[${info.timestamp}] [${info.level}] [CorrelationId: ${info.correlationId || 'none'}]: ${info.message}${info.stack ? `\n${info.stack}` : ''}`
      )
    ),
  }),
  new winston.transports.File({
    filename: path.join(logDirectory, 'error.log'),
    level: 'error',
  }),
  new winston.transports.File({
    filename: path.join(logDirectory, 'combined.log'),
  }),
];

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports,
});
