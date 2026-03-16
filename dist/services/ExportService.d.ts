import type { Company } from '../types';
/**
 * Export Service
 * Exports enriched company data to various formats
 */
export type ExportFormat = 'csv' | 'xlsx' | 'json';
export interface ExportOptions {
    format: ExportFormat;
    filename?: string;
    includeSignals?: boolean;
    includePredictions?: boolean;
    columns?: string[];
}
export declare class ExportService {
    /**
     * Export companies to specified format
     */
    export(companies: Company[], options: ExportOptions): Promise<Buffer>;
    /**
     * Export to CSV format
     */
    private exportToCSV;
    /**
     * Export to JSON format
     */
    private exportToJSON;
    /**
     * Generate filename
     */
    generateFilename(options: ExportOptions): string;
    /**
     * Get export statistics
     */
    getExportStats(companies: Company[]): {
        total: number;
        byRecommendation: Record<string, number>;
        byCountry: Record<string, number>;
        byIndustry: Record<string, number>;
        avgDealScore: number;
    };
}
//# sourceMappingURL=ExportService.d.ts.map