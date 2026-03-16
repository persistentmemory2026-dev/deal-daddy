import axios, { AxiosInstance } from 'axios';
import { OUTSCRAPER_CONFIG } from '../config/outscraper';
import { logger } from '../utils/logger';

/**
 * Outscraper API Client
 * Handles Google Maps scraping and data enrichment
 */

export interface ScrapingTask {
  id: string;
  query: string;
  limit: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results?: GoogleMapsResult[];
  error?: string;
}

export interface GoogleMapsResult {
  name: string;
  full_address: string;
  street: string;
  city: string;
  postal_code: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string;
  site: string;
  email: string;
  social_media: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  rating: number;
  reviews: number;
  category: string;
  working_hours: Record<string, string>;
  photos_count: number;
  verified: boolean;
  owner_name?: string;
  owner_id?: string;
  description?: string;
  subtypes: string[];
  cid: string;
  place_id: string;
}

export class OutscraperClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = OUTSCRAPER_CONFIG.apiKey;
    
    if (!this.apiKey) {
      throw new Error('OUTSCRAPER_API_KEY not configured');
    }

    this.client = axios.create({
      baseURL: OUTSCRAPER_CONFIG.baseUrl,
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor for logging
    this.client.interceptors.request.use((config) => {
      logger.debug(`Outscraper API request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('Outscraper API error:', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
        throw error;
      }
    );
  }

  /**
   * Start a Google Maps scraping task
   */
  async startGoogleMapsScraping(
    queries: string[],
    limit: number = 100,
    options: {
      language?: string;
      region?: string;
      enrichEmails?: boolean;
      enrichSocial?: boolean;
    } = {}
  ): Promise<ScrapingTask> {
    const { language = 'de', region = 'DE', enrichEmails = true, enrichSocial = true } = options;

    logger.info('Starting Google Maps scraping', {
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

      const task: ScrapingTask = {
        id: response.data.id || `task_${Date.now()}`,
        query: queries.join(', '),
        limit: limit * queries.length,
        status: 'completed',
        results: response.data.data || [],
      };

      logger.info('Google Maps scraping completed', {
        taskId: task.id,
        resultsCount: task.results?.length || 0,
      });

      return task;

    } catch (error) {
      logger.error('Failed to start Google Maps scraping', { error });
      throw error;
    }
  }

  /**
   * Start async scraping task (for large datasets)
   */
  async startAsyncScraping(
    queries: string[],
    limit: number = 100,
    webhookUrl?: string
  ): Promise<string> {
    logger.info('Starting async Google Maps scraping', {
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
    logger.info('Async scraping started', { taskId });

    return taskId;
  }

  /**
   * Check async task status
   */
  async getTaskStatus(taskId: string): Promise<ScrapingTask> {
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
  async waitForTask(
    taskId: string,
    options: {
      pollInterval?: number;
      maxWaitTime?: number;
    } = {}
  ): Promise<ScrapingTask> {
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

      logger.debug(`Task ${taskId} still running, waiting...`);
      await this.sleep(pollInterval);
    }

    throw new Error(`Task timeout after ${maxWaitTime}ms`);
  }

  /**
   * Get account balance and usage
   */
  async getAccountInfo(): Promise<{
    balance: number;
    usageThisMonth: number;
    freeTierRemaining: number;
  }> {
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
  buildDACHQueries(
    categories: string[],
    cities: string[],
    options: {
      includeSurrounding?: boolean;
      radius?: number; // in meters
    } = {}
  ): string[] {
    const queries: string[] = [];
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

  private mapStatus(apiStatus: string): ScrapingTask['status'] {
    const statusMap: Record<string, ScrapingTask['status']> = {
      'Pending': 'pending',
      'Running': 'running',
      'Completed': 'completed',
      'Failed': 'failed',
    };
    return statusMap[apiStatus] || 'pending';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
