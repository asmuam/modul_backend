import { createLogger, format, transports } from 'winston';
const { combine, timestamp, printf, colorize } = format;
import config from '../config';

// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Configure Winston logger
const logger = createLogger({
  level: 'silly', // Default log level
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize(), // Colorize for console output
    logFormat
  ),
  transports: [
    new transports.File({ filename: 'logs/server.log' }), // Log to a file
    new transports.File({ filename: 'logs/error.log', level: 'error' }), // Separate file for error logs
  ],
});

// Add console transport for development
if (!['production', 'test'].includes(config.node)) {
  logger.add(new transports.Console({ format: colorize() }));
}

export default logger;
