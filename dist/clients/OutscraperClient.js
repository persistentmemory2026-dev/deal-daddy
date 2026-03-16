"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutscraperClient = void 0;
const axios_1 = __importDefault(require("axios"));
const outscraper_1 = require("../config/outscraper");
const logger_1 = require("../utils/logger");
class OutscraperClient {
    client;
    apiKey;
    constructor() {
        this.apiKey = outscraper_1.OUTSCRAPER_CONFIG.apiKey;
        if (!this.apiKey) {
            throw new Error('OUTSCRAPER_API_KEY not configured');
        }
        this.client = axios_1.default.create({
            baseURL: outscraper_1.OUTSCRAPER_CONFIG.baseUrl,
            headers: {
                'X-API-KEY': this.apiKey,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
        // Request interceptor for logging
        this.client.interceptors.request.use((config) => {
            logger_1.logger.debug(`Outscraper API request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        });
        // Response interceptor for error handling
        this.client.interceptors.response.use((response) => response, (error) => {
            logger_1.logger.error('Outscraper API error:', {
                status: error.response?.status,
                message: error.message,
                data: error.response?.data,
            });
            throw error;
        });
    }
    /**
     * Start a Google Maps scraping task
     */
    async startGoogleMapsScraping(queries, limit = 100, options = {}) {
        const { language = 'de', region = 'DE', enrichEmails = true, enrichSocial = true } = options;
        logger_1.logger.info('Starting Google Maps scraping', {
            queryCount: queries.length,
            limitPerQuery: limit,
            region,
        });
        try {
            const response = await this.client.post('/maps/search-v3', {
                query: queries,
                limit: limit,
                language: language,
                region: region,
                skipEnriching: !enrichEmails, // Skip email enrichment if false
                async: false, // Wait for completion (synchronous for MVP)
            });
            const task = {
                id: response.data.id || `task_${Date.now()}`,
                query: queries.join(', '),
                limit: limit * queries.length,
                status: 'completed',
                results: response.data.data || [],
            };
            logger_1.logger.info('Google Maps scraping completed', {
                taskId: task.id,
                resultsCount: task.results?.length || 0,
            });
            return task;
        }
        catch (error) {
            logger_1.logger.error('Failed to start Google Maps scraping', { error });
            throw error;
        }
    }
    /**
     * Start async scraping task (for large datasets)
     */
    async startAsyncScraping(queries, limit = 100, webhookUrl) {
        logger_1.logger.info('Starting async Google Maps scraping', {
            queryCount: queries.length,
            limitPerQuery: limit,
        });
        const response = await this.client.post('/maps/search-v3', {
            query: queries,
            limit: limit,
            async: true,
            webhook: webhookUrl,
        });
        const taskId = response.data.id;
        logger_1.logger.info('Async scraping started', { taskId });
        return taskId;
    }
    /**
     * Check async task status
     */
    async getTaskStatus(taskId) {
        const response = await this.client.get(`/requests/${taskId}`);
        return {
            id: taskId,
            query: response.data.query || '',
            limit: response.data.limit || 0,
            status: this.mapStatus(response.data.status),
            results: response.data.data,
            error: response.data.error,
        };
    }
    /**
     * Wait for async task completion
     */
    async waitForTask(taskId, options = {}) {
        const { pollInterval = 5000, maxWaitTime = 300000 } = options; // 5s interval, 5min max
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitTime) {
            const task = await this.getTaskStatus(taskId);
            if (task.status === 'completed') {
                return task;
            }
            if (task.status === 'failed') {
                throw new Error(`Task failed: ${task.error}`);
            }
            logger_1.logger.debug(`Task ${taskId} still running, waiting...`);
            await this.sleep(pollInterval);
        }
        throw new Error(`Task timeout after ${maxWaitTime}ms`);
    }
    /**
     * Get account balance and usage
     */
    async getAccountInfo() {
        const response = await this.client.get('/profile');
        return {
            balance: response.data.balance || 0,
            usageThisMonth: response.data.usage_this_month || 0,
            freeTierRemaining: Math.max(0, 500 - (response.data.usage_this_month || 0)),
        };
    }
    /**
     * Build DACH-specific search queries
     */
    buildDACHQueries(categories, cities, options = {}) {
        const queries = [];
        const { includeSurrounding = false } = options;
        for (const category of categories) {
            for (const city of cities) {
                // German query
                queries.push(`${category}, ${city}, Deutschland`);
                // Austrian query
                queries.push(`${category}, ${city}, Österreich`);
                // Swiss query
                queries.push(`${category}, ${city}, Schweiz`);
                if (includeSurrounding) {
                    // Add surrounding areas
                    queries.push(`${category} in der Nähe von ${city}`);
                }
            }
        }
        return queries;
    }
    mapStatus(apiStatus) {
        const statusMap = {
            'Pending': 'pending',
            'Running': 'running',
            'Completed': 'completed',
            'Failed': 'failed',
        };
        return statusMap[apiStatus] || 'pending';
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.OutscraperClient = OutscraperClient;
//# sourceMappingURL=OutscraperClient.js.map