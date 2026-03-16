import { GoogleMapsResult } from '../clients/OutscraperClient';
import type { Company } from '../types';
/**
 * Enrichment Service
 * Transforms raw Outscraper data into M&A-ready company profiles
 */
export declare class EnrichmentService {
    private outscraper;
    constructor();
    /**
     * Enrich a batch of companies from raw Google Maps data
     */
    enrichCompanies(rawResults: GoogleMapsResult[], options?: {
        industry?: string;
        region?: string;
    }): Promise<Company[]>;
    /**
     * Enrich a single company with M&A signals
     */
    private enrichSingleCompany;
    /**
     * Extract M&A relevant signals from raw data
     */
    private extractSignals;
    /**
     * Calculate deal readiness score
     */
    private calculateDealReadiness;
    /**
     * Generate AI summary of the company
     */
    private generateSummary;
    /**
     * Estimate revenue based on available signals
     */
    private estimateRevenue;
    /**
     * Estimate employee count
     */
    private estimateEmployees;
    /**
     * Infer industry from category
     */
    private inferIndustry;
    /**
     * Map country codes
     */
    private mapCountry;
    /**
     * Generate unique company ID
     */
    private generateCompanyId;
}
//# sourceMappingURL=EnrichmentService.d.ts.map