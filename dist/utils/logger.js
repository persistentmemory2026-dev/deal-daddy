"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLoggerStream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, printf, colorize, errors } = winston_1.default.format;
// Custom format
const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});
// Create logger
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service: 'deal-daddy' },
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), customFormat),
    transports: [
        // Console output
        new winston_1.default.transports.Console({
            format: combine(colorize(), customFormat),
        }),
        // File output (production)
        ...(process.env.NODE_ENV === 'production'
            ? [
                new winston_1.default.transports.File({
                    filename: 'logs/error.log',
                    level: 'error'
                }),
                new winston_1.default.transports.File({
                    filename: 'logs/combined.log'
                }),
            ]
            : []),
    ],
});
// Stream for HTTP request logging
exports.httpLoggerStream = {
    write: (message) => {
        exports.logger.info(message.trim());
    },
};
//# sourceMappingURL=logger.js.map