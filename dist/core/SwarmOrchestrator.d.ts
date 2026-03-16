import { EventEmitter } from 'events';
import type { Company, EnrichmentJob, AgentType, SwarmResult, AgentResult } from '../types';
/**
 * SwarmOrchestrator - 2030 Abundance Design
 *
 * Key Principles:
 * 1. PARALLEL BY DEFAULT - All agents run simultaneously
 * 2. UNLIMITED CONCURRENCY - No artificial rate limits
 * 3. INTELLIGENCE FUSION - Multiple AI perspectives merged
 * 4. SELF-IMPROVEMENT - Learns from every execution
 * 5. FAULT TOLERANCE - Individual agent failures don't stop the swarm
 */
export declare class SwarmOrchestrator extends EventEmitter {
    private agentRegistry;
    private activeSwarms;
    constructor();
    registerAgent(agentType: AgentType, handler: AgentHandler): void;
    executeSwarm(company: Company, job: EnrichmentJob): Promise<SwarmResult>;
    private executeAgentWithTimeout;
    private fuseIntelligence;
    private resolveConflict;
    private calculateConfidence;
    executeBatch(jobs: {
        company: Company;
        job: EnrichmentJob;
    }[]): Promise<SwarmResult[]>;
}
export interface AgentHandler {
    execute(company: Company, config: Record<string, unknown>): Promise<AgentResult>;
}
//# sourceMappingURL=SwarmOrchestrator.d.ts.map