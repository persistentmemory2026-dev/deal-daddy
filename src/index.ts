/**
 * Deal Daddy - M&A Longlist Automation Service
 * 
 * Main entry point for the application
 */

import { app } from './api/server';
import { logger } from './utils/logger';

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

// Start server if running directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    logger.info(`🚀 Deal Daddy server running on port ${PORT}`);
    logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    logger.info(`💰 Cost estimator: http://localhost:${PORT}/api/cost/estimate?count=1000`);
  });
}

export { app };
