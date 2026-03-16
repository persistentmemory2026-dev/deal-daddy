"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const sync_1 = require("csv-stringify/sync");
const logger_1 = require("../utils/logger");
class ExportService {
    /**
     * Export companies to specified format
     */
    async export(companies, options) {
        const { format, includeSignals = true } = options;
        logger_1.logger.info(`Exporting ${companies.length} companies as ${format}`);
        switch (format) {
            case 'csv':
                return this.exportToCSV(companies, includeSignals);
            case 'json':
                return this.exportToJSON(companies);
            case 'xlsx':
                // For MVP, we'll use CSV as base and convert
                // Full XLSX support can be added later
                return this.exportToCSV(companies, includeSignals);
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }
    /**
     * Export to CSV format
     */
    exportToCSV(companies, includeSignals) {
        // Define columns
        const columns = [
            { key: 'id', header: 'ID' },
            { key: 'name', header: 'Unternehmen' },
            { key: 'industry', header: 'Branche' },
            { key: 'website', header: 'Website' },
            { key: 'country', header: 'Land' },
            { key: 'city', header: 'Stadt' },
            { key: 'revenue_min', header: 'Umsatz_Min' },
            { key: 'revenue_max', header: 'Umsatz_Max' },
            { key: 'employees', header: 'Mitarbeiter' },
            { key: 'deal_score', header: 'Deal_Score' },
            { key: 'recommendation', header: 'Empfehlung' },
            { key: 'next_action', header: 'Naechste_Aktion' },
            { key: 'ai_summary', header: 'Zusammenfassung' },
        ];
        // Add signal columns if requested
        if (includeSignals) {
            columns.push({ key: 'signal_count', header: 'Signale_Anzahl' }, { key: 'signals', header: 'Signale' });
        }
        // Transform data
        const records = companies.map((company) => ({
            id: company.id,
            name: company.name,
            industry: company.industry || '',
            website: company.website || '',
            country: company.location?.country || '',
            city: company.location?.city || '',
            revenue_min: company.revenue?.min || '',
            revenue_max: company.revenue?.max || '',
            employees: company.employees || '',
            deal_score: company.dealReadiness?.score || 0,
            recommendation: company.dealReadiness?.recommendation || '',
            next_action: company.dealReadiness?.nextBestAction || '',
            ai_summary: company.aiSummary || '',
            signal_count: company.signals?.length || 0,
            signals: includeSignals
                ? company.signals?.map(s => `${s.type}:${s.value}`).join('; ')
                : '',
        }));
        // Generate CSV
        const csv = (0, sync_1.stringify)(records, {
            header: true,
            columns: columns.map(c => ({ key: c.key, header: c.header })),
            delimiter: ';',
        });
        return Buffer.from(csv, 'utf-8');
    }
    /**
     * Export to JSON format
     */
    exportToJSON(companies) {
        const json = JSON.stringify(companies, null, 2);
        return Buffer.from(json, 'utf-8');
    }
    /**
     * Generate filename
     */
    generateFilename(options) {
        const timestamp = new Date().toISOString().split('T')[0];
        const extension = options.format === 'xlsx' ? 'csv' : options.format;
        return options.filename || `deal-daddy-export-${timestamp}.${extension}`;
    }
    /**
     * Get export statistics
     */
    getExportStats(companies) {
        const stats = {
            total: companies.length,
            byRecommendation: {},
            byCountry: {},
            byIndustry: {},
            avgDealScore: 0,
        };
        let totalScore = 0;
        companies.forEach((company) => {
            // By recommendation
            const rec = company.dealReadiness?.recommendation || 'unknown';
            stats.byRecommendation[rec] = (stats.byRecommendation[rec] || 0) + 1;
            // By country
            const country = company.location?.country || 'Unknown';
            stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;
            // By industry
            const industry = company.industry || 'Unknown';
            stats.byIndustry[industry] = (stats.byIndustry[industry] || 0) + 1;
            // Deal score
            totalScore += company.dealReadiness?.score || 0;
        });
        stats.avgDealScore = companies.length > 0
            ? Math.round(totalScore / companies.length)
            : 0;
        return stats;
    }
}
exports.ExportService = ExportService;
//# sourceMappingURL=ExportService.js.map