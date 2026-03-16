"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const sync_1 = require("csv-parse/sync");
const OutscraperClient_1 = require("../clients/OutscraperClient");
const EnrichmentService_1 = require("../services/EnrichmentService");
const ExportService_1 = require("../services/ExportService");
const logger_1 = require("../utils/logger");
const outscraper_1 = require("../config/outscraper");
/**
 * Deal Daddy API Server
 * MVP version - simple REST API for longlist generation
 */
const app = (0, express_1.default)();
exports.app = app;
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Middleware
app.use(express_1.default.json());
// Services
const outscraper = new OutscraperClient_1.OutscraperClient();
const enrichment = new EnrichmentService_1.EnrichmentService();
const exporter = new ExportService_1.ExportService();
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
/**
 * POST /api/longlist/generate
 * Generate a longlist from search criteria
 */
app.post('/api/longlist/generate', async (req, res) => {
    try {
        const { categories, cities, limit = 100, format = 'csv', enrich = true } = req.body;
        if (!categories || !cities) {
            return res.status(400).json({
                error: 'Categories and cities are required'
            });
        }
        logger_1.logger.info('Longlist generation started', { categories, cities, limit });
        // Build queries
        const queries = outscraper.buildDACHQueries(categories, cities);
        // Calculate cost
        const estimatedCost = (0, outscraper_1.calculateScrapingCost)(queries.length * limit);
        // Start scraping
        const task = await outscraper.startGoogleMapsScraping(queries.slice(0, 10), // Limit to 10 queries for MVP
        limit, { language: 'de', region: 'DE' });
        if (!task.results || task.results.length === 0) {
            return res.status(404).json({ error: 'No companies found' });
        }
        // Enrich data
        let companies = [];
        if (enrich) {
            companies = await enrichment.enrichCompanies(task.results, {
                industry: categories[0],
            });
        }
        // Export
        const exportOptions = {
            format: format,
            includeSignals: true
        };
        const buffer = await exporter.export(companies, exportOptions);
        const stats = exporter.getExportStats(companies);
        // Set headers for file download
        const filename = exporter.generateFilename(exportOptions);
        res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
        logger_1.logger.info('Longlist generation completed', {
            companiesFound: companies.length,
            estimatedCost,
            stats,
        });
    }
    catch (error) {
        logger_1.logger.error('Longlist generation failed', { error });
        res.status(500).json({
            error: 'Generation failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * POST /api/longlist/upload
 * Generate longlist from uploaded CSV with company names
 */
app.post('/api/longlist/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const format = req.body.format || 'csv';
        // Parse CSV
        const content = req.file.buffer.toString('utf-8');
        const records = (0, sync_1.parse)(content, {
            columns: true,
            skip_empty_lines: true,
        });
        logger_1.logger.info(`Processing ${records.length} companies from upload`);
        // Extract company names and locations
        const companyNames = records.map((r) => r.name || r.company || r.unternehmen || r.firma || Object.values(r)[0]).filter(Boolean);
        if (companyNames.length === 0) {
            return res.status(400).json({ error: 'No valid company names found in CSV' });
        }
        // Build search queries
        const queries = companyNames.map(name => `${name}, Deutschland`);
        // Scrape each company
        const allResults = [];
        for (const query of queries.slice(0, 50)) { // Limit to 50 for MVP
            try {
                const task = await outscraper.startGoogleMapsScraping([query], 1);
                if (task.results && task.results.length > 0) {
                    allResults.push(...task.results);
                }
            }
            catch (e) {
                logger_1.logger.warn(`Failed to scrape: ${query}`);
            }
        }
        if (allResults.length === 0) {
            return res.status(404).json({ error: 'No companies found' });
        }
        // Enrich
        const companies = await enrichment.enrichCompanies(allResults);
        // Export
        const exportOptions = {
            format: format,
            includeSignals: true
        };
        const buffer = await exporter.export(companies, exportOptions);
        const filename = exporter.generateFilename(exportOptions);
        res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    }
    catch (error) {
        logger_1.logger.error('Upload processing failed', { error });
        res.status(500).json({
            error: 'Processing failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * GET /api/cost/estimate
 * Estimate cost for a longlist
 */
app.get('/api/cost/estimate', (req, res) => {
    const count = parseInt(req.query.count) || 1000;
    const cost = (0, outscraper_1.calculateScrapingCost)(count);
    res.json({
        companyCount: count,
        outscraperCost: cost,
        estimatedTotalCost: cost * 1.5, // Including enrichment
        currency: 'USD',
    });
});
/**
 * GET /api/stats
 * Get account stats
 */
app.get('/api/stats', async (req, res) => {
    try {
        const accountInfo = await outscraper.getAccountInfo();
        res.json(accountInfo);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});
// Error handler
app.use((err, req, res, next) => {
    logger_1.logger.error('Unhandled error', { error: err });
    res.status(500).json({ error: 'Internal server error' });
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger_1.logger.info(`Deal Daddy API server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map