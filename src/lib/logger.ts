/**
 * Structured logger with secret masking.
 *
 * Replaces patterns that look like API keys, tokens, or passwords with [REDACTED].
 * Outputs JSON in production for log aggregation, human-readable in dev.
 */

const SECRET_PATTERNS = [
  /sk[-_](?:test|live|prod)?[-_]?[A-Za-z0-9]{20,}/g,       // OpenAI / Stripe style
  /pk[-_](?:test|live|prod)?[-_]?[A-Za-z0-9]{20,}/g,       // Clerk publishable key
  /(?:password|passwd|pwd|secret|token|api_key)["']?\s*[:=]\s*["']?[^\s"',}{]+/gi,
  /Bearer\s+[A-Za-z0-9._~+/=-]+/g,                         // Bearer tokens
  /postgresql:\/\/[^@]+@/g,                                  // DB connection strings (user:pass part)
];

function maskSecrets(message: string): string {
  let masked = message;
  for (const pattern of SECRET_PATTERNS) {
    masked = masked.replace(pattern, '[REDACTED]');
  }
  return masked;
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message: maskSecrets(message),
    ...(meta ? { meta: JSON.parse(maskSecrets(JSON.stringify(meta))) } : {}),
  };

  if (process.env.NODE_ENV === 'production') {
    const output = level === 'error' ? console.error : console.log;
    output(JSON.stringify(entry));
  } else {
    const output = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    output(`[${entry.timestamp}] ${level.toUpperCase()}: ${entry.message}`, meta || '');
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
};
