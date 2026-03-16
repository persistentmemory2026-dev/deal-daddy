import { OutscraperClient, GoogleMapsResult } from '../clients/OutscraperClient';
import type { Company, Signal, DealReadiness, Location, RevenueEstimate } from '../types';
import { logger } from '../utils/logger';

/**
 * Enrichment Service
 * Transforms raw Outscraper data into M&A-ready company profiles
 */

export class EnrichmentService {
  private outscraper: OutscraperClient;

  constructor() {
    this.outscraper = new OutscraperClient();
  }

  /**
   * Enrich a batch of companies from raw Google Maps data
   */
  async enrichCompanies(
    rawResults: GoogleMapsResult[],
    options: {
      industry?: string;
      region?: string;
    } = {}
  ): Promise<Company[]> {
    logger.info(`Enriching ${rawResults.length} companies`);

    const companies = await Promise.all(
      rawResults.map((result) => this.enrichSingleCompany(result, options))
    );

    // Sort by deal readiness score
    return companies.sort((a, b) => {
      const scoreA = a.dealReadiness?.score || 0;
      const scoreB = b.dealReadiness?.score || 0;
      return scoreB - scoreA;
    });
  }

  /**
   * Enrich a single company with M&A signals
   */
  private async enrichSingleCompany(
    raw: GoogleMapsResult,
    options: { industry?: string; region?: string }
  ): Promise<Company> {
    const id = this.generateCompanyId(raw);
    
    // Build location
    const location: Location = {
      country: this.mapCountry(raw.country),
      region: raw.state,
      city: raw.city,
      postalCode: raw.postal_code,
      coordinates: raw.latitude && raw.longitude 
        ? { lat: raw.latitude, lng: raw.longitude }
        : undefined,
    };

    // Extract signals
    const signals = this.extractSignals(raw);

    // Estimate revenue (rough heuristic based on reviews/photos)
    const revenue = this.estimateRevenue(raw);

    // Calculate deal readiness
    const dealReadiness = this.calculateDealReadiness(raw, signals);

    // Generate AI summary
    const aiSummary = this.generateSummary(raw, signals, dealReadiness);

    return {
      id,
      name: raw.name,
      website: raw.site || undefined,
      industry: options.industry || this.inferIndustry(raw.category, raw.subtypes),
      location,
      revenue,
      employees: this.estimateEmployees(raw),
      
      signals,
      predictions: [], // Would be populated by prediction agent
      relationships: [], // Would be populated by relationship agent
      
      aiSummary,
      dealReadiness,
      
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };
  }

  /**
   * Extract M&A relevant signals from raw data
   */
  private extractSignals(raw: GoogleMapsResult): Signal[] {
    const signals: Signal[] = [];

    // Signal 1: Company has website (indicates digital maturity)
    if (raw.site) {
      signals.push({
        type: 'growth_indicator',
        value: 'has_website',
        confidence: 0.8,
        source: 'google_maps',
        detectedAt: new Date(),
      });
    }

    // Signal 2: Verified business (indicates established presence)
    if (raw.verified) {
      signals.push({
        type: 'growth_indicator',
        value: 'verified_business',
        confidence: 0.7,
        source: 'google_maps',
        detectedAt: new Date(),
      });
    }

    // Signal 3: High review count (indicates size/market presence)
    if (raw.reviews > 50) {
      signals.push({
        type: 'growth_indicator',
        value: 'established_presence',
        confidence: Math.min(raw.reviews / 200, 0.9),
        source: 'google_maps',
        detectedAt: new Date(),
      });
    }

    // Signal 4: Multiple photos (indicates investment in presence)
    if (raw.photos_count > 10) {
      signals.push({
        type: 'growth_indicator',
        value: 'active_marketing',
        confidence: Math.min(raw.photos_count / 50, 0.8),
        source: 'google_maps',
        detectedAt: new Date(),
      });
    }

    // Signal 5: Has email contact (reachable for outreach)
    if (raw.email) {
      signals.push({
        type: 'expansion_signal',
        value: 'direct_contact_available',
        confidence: 0.9,
        source: 'google_maps',
        detectedAt: new Date(),
      });
    }

    // Signal 6: Rating quality
    if (raw.rating >= 4.0) {
      signals.push({
        type: 'market_position',
        value: 'high_customer_satisfaction',
        confidence: (raw.rating - 3) / 2,
        source: 'google_maps',
        detectedAt: new Date(),
      });
    }

    // Signal 7: Owner name available (succession research possible)
    if (raw.owner_name) {
      signals.push({
        type: 'succession_mention',
        value: 'owner_identified',
        confidence: 0.6,
        source: 'google_maps',
        detectedAt: new Date(),
      });
    }

    return signals;
  }

  /**
   * Calculate deal readiness score
   */
  private calculateDealReadiness(
    raw: GoogleMapsResult,
    signals: Signal[]
  ): DealReadiness {
    // Base score
    let score = 30;

    // Factors
    const factors = {
      successionUrgency: 0,
      marketPosition: 0,
      financialHealth: 0,
      ownerMotivation: 0,
    };

    // Market Position (based on reviews and rating)
    if (raw.reviews > 0) {
      factors.marketPosition += Math.min(raw.reviews / 100, 0.4);
      factors.marketPosition += (raw.rating / 5) * 0.3;
    }

    // Financial Health (proxy: online presence investment)
    if (raw.site) factors.financialHealth += 0.2;
    if (raw.photos_count > 10) factors.financialHealth += 0.1;
    if (raw.verified) factors.financialHealth += 0.1;

    // Owner Motivation (proxy: contact availability)
    if (raw.email) factors.ownerMotivation += 0.2;
    if (raw.phone) factors.ownerMotivation += 0.2;
    if (raw.site) factors.ownerMotivation += 0.1;

    // Calculate total score
    score += factors.marketPosition * 25;
    score += factors.financialHealth * 25;
    score += factors.ownerMotivation * 20;

    // Determine recommendation
    let recommendation: DealReadiness['recommendation'];
    if (score >= 70) {
      recommendation = 'hot';
    } else if (score >= 50) {
      recommendation = 'warm';
    } else if (score >= 30) {
      recommendation = 'cold';
    } else {
      recommendation = 'nurture';
    }

    // Next best action
    let nextBestAction = '';
    if (!raw.email && !raw.phone) {
      nextBestAction = 'Research direct contact via website or LinkedIn';
    } else if (factors.marketPosition < 0.3) {
      nextBestAction = 'Deep-dive market analysis needed';
    } else if (score >= 70) {
      nextBestAction = 'Immediate outreach recommended';
    } else {
      nextBestAction = 'Add to nurturing sequence';
    }

    return {
      score: Math.round(score),
      factors: {
        successionUrgency: Math.round(factors.successionUrgency * 100),
        marketPosition: Math.round(factors.marketPosition * 100),
        financialHealth: Math.round(factors.financialHealth * 100),
        ownerMotivation: Math.round(factors.ownerMotivation * 100),
      },
      recommendation,
      nextBestAction,
    };
  }

  /**
   * Generate AI summary of the company
   */
  private generateSummary(
    raw: GoogleMapsResult,
    signals: Signal[],
    dealReadiness: DealReadiness
  ): string {
    const parts: string[] = [];

    // Basic info
    parts.push(`${raw.name} ist ein ${raw.category || 'Unternehmen'} in ${raw.city}.`);

    // Market presence
    if (raw.reviews > 0) {
      parts.push(`Bewertung: ${raw.rating}/5 (${raw.reviews} Reviews).`);
    }

    // Contact
    const contacts: string[] = [];
    if (raw.email) contacts.push('Email');
    if (raw.phone) contacts.push('Telefon');
    if (raw.site) contacts.push('Website');
    if (contacts.length > 0) {
      parts.push(`Erreichbar via: ${contacts.join(', ')}.`);
    }

    // Deal recommendation
    parts.push(`Deal-Readiness: ${dealReadiness.score}/100 (${dealReadiness.recommendation.toUpperCase()}).`);
    parts.push(`Empfohlene Aktion: ${dealReadiness.nextBestAction}`);

    return parts.join(' ');
  }

  /**
   * Estimate revenue based on available signals
   */
  private estimateRevenue(raw: GoogleMapsResult): RevenueEstimate | undefined {
    // Very rough estimation based on reviews and category
    let baseRevenue = 0;
    
    if (raw.reviews < 10) {
      baseRevenue = 500000;
    } else if (raw.reviews < 50) {
      baseRevenue = 2000000;
    } else if (raw.reviews < 200) {
      baseRevenue = 5000000;
    } else {
      baseRevenue = 10000000;
    }

    // Adjust for category
    const highValueCategories = ['Anwalt', 'Steuerberater', 'Unternehmensberatung', 'IT'];
    if (highValueCategories.some(cat => raw.category?.includes(cat))) {
      baseRevenue *= 1.5;
    }

    return {
      min: Math.round(baseRevenue * 0.5),
      max: Math.round(baseRevenue * 2),
      confidence: 0.4, // Low confidence, just an estimate
      currency: 'EUR',
      source: 'inferred',
      year: new Date().getFullYear(),
    };
  }

  /**
   * Estimate employee count
   */
  private estimateEmployees(raw: GoogleMapsResult): number | undefined {
    // Rough estimate based on reviews
    if (raw.reviews < 10) return 5;
    if (raw.reviews < 50) return 15;
    if (raw.reviews < 200) return 50;
    return 100;
  }

  /**
   * Infer industry from category
   */
  private inferIndustry(category: string, subtypes: string[]): string {
    const categoryMap: Record<string, string> = {
      'Maschinenbau': 'Maschinenbau',
      'Elektro': 'Elektrotechnik',
      'Software': 'Software',
      'IT': 'IT-Dienstleistungen',
      'Beratung': 'Unternehmensberatung',
      'Rechtsanwalt': 'Rechtsberatung',
      'Steuerberater': 'Steuerberatung',
      'Bau': 'Bau',
      'Handel': 'Handel',
      'Logistik': 'Logistik',
    };

    const searchText = `${category} ${subtypes.join(' ')}`.toLowerCase();
    
    for (const [key, value] of Object.entries(categoryMap)) {
      if (searchText.includes(key.toLowerCase())) {
        return value;
      }
    }

    return 'Sonstige';
  }

  /**
   * Map country codes
   */
  private mapCountry(countryCode: string): string {
    const map: Record<string, string> = {
      'DE': 'Deutschland',
      'AT': 'Österreich',
      'CH': 'Schweiz',
    };
    return map[countryCode] || countryCode;
  }

  /**
   * Generate unique company ID
   */
  private generateCompanyId(raw: GoogleMapsResult): string {
    // Use place_id if available, otherwise hash name+address
    if (raw.place_id) {
      return `comp_${raw.place_id}`;
    }
    
    const hash = Buffer.from(`${raw.name}-${raw.full_address}`).toString('base64').substring(0, 12);
    return `comp_${hash}`;
  }
}
