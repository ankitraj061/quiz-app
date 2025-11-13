import { config } from '../config';

const isProduction = config.isProduction;

type LogLevel = 'info' | 'warn' | 'error';
type LogMeta = Record<string, unknown>;

function getTimestamp(): string {
  return new Date().toISOString();
}

function log(level: LogLevel, message: string, meta: LogMeta = {}): void {
  if (isProduction) {
    const logEntry = {
      level,
      message,
      timestamp: getTimestamp(),
      ...meta,
    };
    console.log(JSON.stringify(logEntry));
  } else {
    const colorMap: Record<LogLevel, string> = {
      info: '\x1b[36m',   // cyan
      warn: '\x1b[33m',   // yellow
      error: '\x1b[31m',  // red
    };
    const reset = '\x1b[0m';
    const color = colorMap[level];
    const extras = Object.keys(meta).length
      ? ' ' + JSON.stringify(meta, null, 2)
      : '';

    console.log(
      `${color}[${level.toUpperCase()}]${reset} ${getTimestamp()} ${message}${extras}`
    );
  }
}

export const logger = {
  info(message: string, meta: LogMeta = {}): void {
    log('info', message, meta);
  },
  warn(message: string, meta: LogMeta = {}): void {
    log('warn', message, meta);
  },
  error(message: string, meta: LogMeta = {}): void {
    log('error', message, meta);
  },
};