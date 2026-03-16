export declare const OUTSCRAPER_CONFIG: {
    apiKey: string;
    baseUrl: string;
    maxRequestsPerSecond: number;
    maxParallelRequests: number;
    pricing: {
        freeTier: number;
        mediumTierMax: number;
        mediumTierPrice: number;
        businessTierPrice: number;
    };
    enrichment: {
        emails: {
            enabled: boolean;
            provider: string;
            costPerEmail: number;
        };
        phones: {
            enabled: boolean;
            provider: string;
            costPerPhone: number;
        };
        social: {
            enabled: boolean;
            platforms: string[];
        };
    };
    dachRegions: {
        country: string;
        language: string;
    }[];
    maCategories: string[];
};
export declare function calculateScrapingCost(businessCount: number): number;
//# sourceMappingURL=outscraper.d.ts.map