"use strict";
/**
 * Deal Daddy - M&A Longlist Automation Service
 *
 * Main entry point for the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const server_1 = require("./api/server");
Object.defineProperty(exports, "app", { enumerable: true, get: function () { return server_1.app; } });
const logger_1 = require("./utils/logger");
// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception', { error });
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection', { reason, promise });
});
// Start server if running directly
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    server_1.app.listen(PORT, () => {
        logger_1.logger.info(`🚀 Deal Daddy server running on port ${PORT}`);
        logger_1.logger.info(`📊 Health check: http://localhost:${PORT}/health`);
        logger_1.logger.info(`💰 Cost estimator: http://localhost:${PORT}/api/cost/estimate?count=1000`);
    });
}
//# sourceMappingURL=index.js.map