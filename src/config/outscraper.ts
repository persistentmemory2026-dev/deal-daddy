// Outscraper API Configuration
// Cost-optimized for DACH M&A Longlist Service

export const OUTSCRAPER_CONFIG = {
  // API Settings
  apiKey: process.env.OUTSCRAPER_API_KEY || '',
  baseUrl: 'https://api.app.outscraper.com',
  
  // Rate Limits (Outscraper allows generous limits)
  maxRequestsPerSecond: 10,
  maxParallelRequests: 5,
  
  // Cost Thresholds
  pricing: {
    freeTier: 500,           // First 500 businesses free
    mediumTierMax: 100000,   // Up to 100k at $3/1k
    mediumTierPrice: 3,      // $3 per 1000
    businessTierPrice: 1,    // $1 per 1000 after 100k
  },
  
  // Enrichment Services
  enrichment: {
    emails: {
      enabled: true,
      provider: 'outscraper', // or 'zerobounce'
      costPerEmail: 0.001,
    },
    phones: {
      enabled: true,
      provider: 'outscraper',
      costPerPhone: 0.01,
    },
    social: {
      enabled: true,
      platforms: ['linkedin', 'facebook', 'instagram'],
    },
  },
  
  // DACH-specific search parameters
  dachRegions: [
    { country: 'DE', language: 'de' },
    { country: 'AT', language: 'de' },
    { country: 'CH', language: 'de' },
  ],
  
  // M&A Relevant Categories
  maCategories: [
    'Maschinenbau',
    'Elektrotechnik',
    'Automotive',
    'Medizintechnik',
    'IT-Dienstleistungen',
    'Software',
    'Industrielle Dienstleistungen',
    'Bau',
    'Handel',
    'Logistik',
  ],
};

// Cost Calculator
export function calculateScrapingCost(businessCount: number): number {
  const { freeTier, mediumTierMax, mediumTierPrice, businessTierPrice } = OUTSCRAPER_CONFIG.pricing;
  
  if (businessCount <= freeTier) {
    return 0;
  }
  
  const paidCount = businessCount - freeTier;
  
  if (businessCount <= mediumTierMax) {
    return (paidCount / 1000) * mediumTierPrice;
  }
  
  // Mixed pricing: medium tier + business tier
  const mediumTierCount = mediumTierMax - freeTier;
  const businessTierCount = paidCount - mediumTierCount;
  
  return (mediumTierCount / 1000) * mediumTierPrice + 
         (businessTierCount / 1000) * businessTierPrice;
}

// Example: calculateScrapingCost(10000) = $28.50
