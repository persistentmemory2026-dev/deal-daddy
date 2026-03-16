export interface Company {
    id: string;
    name: string;
    website?: string;
    industry?: string;
    location?: Location;
    revenue?: RevenueEstimate;
    employees?: number;
    founded?: number;
    signals: Signal[];
    predictions: Prediction[];
    relationships: Relationship[];
    aiSummary?: string;
    dealReadiness?: DealReadiness;
    voiceTranscripts?: VoiceTranscript[];
    createdAt: Date;
    updatedAt: Date;
    version: number;
}
export interface Location {
    country: string;
    region?: string;
    city?: string;
    postalCode?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}
export interface RevenueEstimate {
    min: number;
    max: number;
    confidence: number;
    currency: string;
    source: 'scraped' | 'predicted' | 'declared' | 'inferred';
    year: number;
}
export interface Signal {
    type: SignalType;
    value: string | number | boolean;
    confidence: number;
    source: string;
    detectedAt: Date;
    expiresAt?: Date;
}
export type SignalType = 'ceo_age' | 'succession_mention' | 'growth_indicator' | 'financial_stress' | 'expansion_signal' | 'regulatory_change' | 'competitor_movement' | 'patent_filing' | 'hiring_spike' | 'voice_call_completed' | 'email_engagement' | 'market_position';
export interface Prediction {
    type: string;
    probability: number;
    timeframe: string;
    reasoning: string;
    model: string;
    generatedAt: Date;
}
export interface Relationship {
    targetCompanyId: string;
    type: 'competitor' | 'supplier' | 'customer' | 'partner' | 'subsidiary' | 'investor';
    strength: number;
    evidence: string[];
}
export interface DealReadiness {
    score: number;
    factors: {
        successionUrgency: number;
        marketPosition: number;
        financialHealth: number;
        ownerMotivation: number;
    };
    recommendation: 'hot' | 'warm' | 'cold' | 'nurture';
    nextBestAction: string;
}
export interface VoiceTranscript {
    callId: string;
    date: Date;
    participants: string[];
    transcript: string;
    summary: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    actionItems: string[];
    dealInterest: number;
}
export interface EnrichmentJob {
    id: string;
    companyId: string;
    priority: number;
    agents: AgentTask[];
    status: 'pending' | 'running' | 'completed' | 'failed';
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}
export interface AgentTask {
    agent: AgentType;
    config: Record<string, unknown>;
    result?: unknown;
    error?: string;
}
export type AgentType = 'web_scraper' | 'voice_caller' | 'predictor' | 'verifier' | 'social_analyzer' | 'document_reader' | 'satellite_analyst' | 'financial_modeler';
export interface SwarmResult {
    companyId: string;
    agentResults: Map<AgentType, AgentResult>;
    fusedResult: Company;
    confidence: number;
    conflicts: Conflict[];
    processingTime: number;
}
export interface AgentResult {
    agent: AgentType;
    success: boolean;
    data: unknown;
    confidence: number;
    processingTime: number;
    error?: string;
}
export interface Conflict {
    field: string;
    values: unknown[];
    agents: AgentType[];
    resolution: string;
}
//# sourceMappingURL=index.d.ts.map