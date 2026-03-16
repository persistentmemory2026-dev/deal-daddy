import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { OutscraperClient } from '../clients/OutscraperClient';
import { EnrichmentService } from '../services/EnrichmentService';
import { ExportService } from '../services/ExportService';
import { logger } from '../utils/logger';
import { calculateScrapingCost } from '../config/outscraper';
import type { Company } from '../types';

/**
 * Deal Daddy API Server
 * MVP version - simple REST API for longlist generation
 */

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(express.json());

// Services
const outscraper = new OutscraperClient();
const enrichment = new EnrichmentService();
const exporter = new ExportService();

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
    const { 
      categories, 
      cities, 
      limit = 100,
      format = 'csv',
      enrich = true 
    } = req.body;

    if (!categories || !cities) {
      return res.status(400).json({ 
        error: 'Categories and cities are required' 
      });
    }

    logger.info('Longlist generation started', { categories, cities, limit });

    // Build queries
    const queries = outscraper.buildDACHQueries(categories, cities);
    
    // Calculate cost
    const estimatedCost = calculateScrapingCost(queries.length * limit);

    // Start scraping
    const task = await outscraper.startGoogleMapsScraping(
      queries.slice(0, 10), // Limit to 10 queries for MVP
      limit,
      { language: 'de', region: 'DE' }
    );

    if (!task.results || task.results.length === 0) {
      return res.status(404).json({ error: 'No companies found' });
    }

    // Enrich data
    let companies: Company[] = [];
    if (enrich) {
      companies = await enrichment.enrichCompanies(task.results, {
        industry: categories[0],
      });
    }

    // Export
    const exportOptions: { format: 'csv' | 'json' | 'xlsx'; includeSignals: boolean } = { 
      format: format as 'csv' | 'json' | 'xlsx', 
      includeSignals: true 
    };
    const buffer = await exporter.export(companies, exportOptions);
    const stats = exporter.getExportStats(companies);

    // Set headers for file download
    const filename = exporter.generateFilename(exportOptions);
    res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(buffer);

    logger.info('Longlist generation completed', {
      companiesFound: companies.length,
      estimatedCost,
      stats,
    });

  } catch (error) {
    logger.error('Longlist generation failed', { error });
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

    const format = (req.body.format as string) || 'csv';
    
    // Parse CSV
    const content = req.file.buffer.toString('utf-8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
    });

    logger.info(`Processing ${records.length} companies from upload`);

    // Extract company names and locations
    const companyNames: string[] = records.map((r: Record<string, string>) => 
      r.name || r.company || r.unternehmen || r.firma || Object.values(r)[0]
    ).filter(Boolean);

    if (companyNames.length === 0) {
      return res.status(400).json({ error: 'No valid company names found in CSV' });
    }

    // Build search queries
    const queries = companyNames.map(name => `${name}, Deutschland`);
    
    // Scrape each company
    const allResults: any[] = [];
    for (const query of queries.slice(0, 50)) { // Limit to 50 for MVP
      try {
        const task = await outscraper.startGoogleMapsScraping([query], 1);
        if (task.results && task.results.length > 0) {
          allResults.push(...task.results);
        }
      } catch (e) {
        logger.warn(`Failed to scrape: ${query}`);
      }
    }

    if (allResults.length === 0) {
      return res.status(404).json({ error: 'No companies found' });
    }

    // Enrich
    const companies = await enrichment.enrichCompanies(allResults);

    // Export
    const exportOptions: { format: 'csv' | 'json' | 'xlsx'; includeSignals: boolean } = { 
      format: format as 'csv' | 'json' | 'xlsx', 
      includeSignals: true 
    };
    const buffer = await exporter.export(companies, exportOptions);

    const filename = exporter.generateFilename(exportOptions);
    res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(buffer);

  } catch (error) {
    logger.error('Upload processing failed', { error });
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
  const count = parseInt(req.query.count as string) || 1000;
  const cost = calculateScrapingCost(count);
  
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err });
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Deal Daddy API server running on port ${PORT}`);
});

export { app };
