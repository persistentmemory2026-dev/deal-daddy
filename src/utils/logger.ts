import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format
const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Create logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'deal-daddy' },
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    customFormat
  ),
  transports: [
    // Console output
    new winston.transports.Console({
      format: combine(
        colorize(),
        customFormat
      ),
    }),
    
    // File output (production)
    ...(process.env.NODE_ENV === 'production' 
      ? [
          new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error' 
          }),
          new winston.transports.File({ 
            filename: 'logs/combined.log' 
          }),
        ]
      : []),
  ],
});

// Stream for HTTP request logging
export const httpLoggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
