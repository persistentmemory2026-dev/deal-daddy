import type { Company, AgentResult } from '../types';
/**
 * WebScraperAgent - 2030 Abundance Design
 *
 * NOTE: For MVP, we use Outscraper API instead of direct scraping.
 * This agent is reserved for future advanced scraping needs.
 */
export interface ScraperConfig {
    url?: string;
    selectors: Record<string, string>;
    waitFor?: string;
    timeout?: number;
    takeScreenshot?: boolean;
    executeJavaScript?: boolean;
}
export declare class WebScraperAgent {
    execute(company: Company, config: ScraperConfig): Promise<AgentResult>;
}
//# sourceMappingURL=WebScraperAgent.d.ts.map