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
export declare class OutscraperClient {
    private client;
    private apiKey;
    constructor();
    /**
     * Start a Google Maps scraping task
     */
    startGoogleMapsScraping(queries: string[], limit?: number, options?: {
        language?: string;
        region?: string;
        enrichEmails?: boolean;
        enrichSocial?: boolean;
    }): Promise<ScrapingTask>;
    /**
     * Start async scraping task (for large datasets)
     */
    startAsyncScraping(queries: string[], limit?: number, webhookUrl?: string): Promise<string>;
    /**
     * Check async task status
     */
    getTaskStatus(taskId: string): Promise<ScrapingTask>;
    /**
     * Wait for async task completion
     */
    waitForTask(taskId: string, options?: {
        pollInterval?: number;
        maxWaitTime?: number;
    }): Promise<ScrapingTask>;
    /**
     * Get account balance and usage
     */
    getAccountInfo(): Promise<{
        balance: number;
        usageThisMonth: number;
        freeTierRemaining: number;
    }>;
    /**
     * Build DACH-specific search queries
     */
    buildDACHQueries(categories: string[], cities: string[], options?: {
        includeSurrounding?: boolean;
        radius?: number;
    }): string[];
    private mapStatus;
    private sleep;
}
//# sourceMappingURL=OutscraperClient.d.ts.map