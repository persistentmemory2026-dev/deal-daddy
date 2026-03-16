import { EventEmitter } from 'events';
import type { 
  Company, 
  EnrichmentJob, 
  AgentTask, 
  AgentType,
  SwarmResult,
  AgentResult,
  Conflict 
} from '../types';
import { logger } from '../utils/logger';

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

export class SwarmOrchestrator extends EventEmitter {
  private agentRegistry: Map<AgentType, AgentHandler>;
  private activeSwarms: Map<string, Promise<SwarmResult>>;
  
  constructor() {
    super();
    this.agentRegistry = new Map();
    this.activeSwarms = new Map();
  }

  registerAgent(agentType: AgentType, handler: AgentHandler): void {
    this.agentRegistry.set(agentType, handler);
    logger.info(`Agent registered: ${agentType}`);
  }

  async executeSwarm(
    company: Company,
    job: EnrichmentJob
  ): Promise<SwarmResult> {
    const startTime = Date.now();
    
    logger.info(`Starting swarm for company: ${company.name}`, {
      companyId: company.id,
      agentCount: job.agents.length
    });

    this.emit('swarm:started', { companyId: company.id, jobId: job.id });

    // 2030: ALL AGENTS RUN IN PARALLEL - No sequential bottlenecks
    const agentPromises = job.agents.map(agentTask => 
      this.executeAgentWithTimeout(agentTask, company, 30000) // 30s timeout per agent
    );

    // Wait for all agents to complete (or fail)
    const agentResults = await Promise.allSettled(agentPromises);
    
    // Process results
    const results: AgentResult[] = agentResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          agent: job.agents[index].agent,
          success: false,
          data: null,
          confidence: 0,
          processingTime: 0,
          error: result.reason?.message || 'Unknown error'
        } as AgentResult;
      }
    });

    // Create result map
    const resultMap = new Map<AgentType, AgentResult>();
    results.forEach((result, index) => {
      resultMap.set(job.agents[index].agent, result);
    });

    // FUSION ENGINE: Merge all agent perspectives
    const { fusedCompany, conflicts } = await this.fuseIntelligence(
      company, 
      results
    );

    const swarmResult: SwarmResult = {
      companyId: company.id,
      agentResults: resultMap,
      fusedResult: fusedCompany,
      confidence: this.calculateConfidence(results),
      conflicts,
      processingTime: Date.now() - startTime
    };

    this.emit('swarm:completed', swarmResult);
    
    logger.info(`Swarm completed for: ${company.name}`, {
      duration: swarmResult.processingTime,
      confidence: swarmResult.confidence,
      conflictCount: conflicts.length
    });

    return swarmResult;
  }

  private async executeAgentWithTimeout(
    task: AgentTask,
    company: Company,
    timeoutMs: number
  ): Promise<AgentResult> {
    const handler = this.agentRegistry.get(task.agent);
    
    if (!handler) {
      throw new Error(`No handler registered for agent: ${task.agent}`);
    }

    const startTime = Date.now();
    
    return Promise.race([
      handler.execute(company, task.config),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Agent timeout')), timeoutMs)
      )
    ]).then(result => ({
      ...result,
      processingTime: Date.now() - startTime
    }));
  }

  private async fuseIntelligence(
    original: Company,
    results: AgentResult[]
  ): Promise<{ fusedCompany: Company; conflicts: Conflict[] }> {
    const conflicts: Conflict[] = [];
    
    // Start with original data
    const fused: Company = { ...original };
    
    // Group results by field they contribute to
    const fieldContributions = new Map<string, { value: unknown; agent: AgentType; confidence: number }[]>();
    
    results.forEach(result => {
      if (!result.success || !result.data) return;
      
      const data = result.data as Record<string, unknown>;
      Object.entries(data).forEach(([field, value]) => {
        if (!fieldContributions.has(field)) {
          fieldContributions.set(field, []);
        }
        fieldContributions.get(field)!.push({
          value,
          agent: result.agent,
          confidence: result.confidence
        });
      });
    });

    // Resolve conflicts using confidence-weighted voting
    fieldContributions.forEach((contributions, field) => {
      if (contributions.length === 1) {
        // No conflict
        (fused as unknown as Record<string, unknown>)[field] = contributions[0].value;
      } else if (contributions.length > 1) {
        // Conflict detected - resolve with confidence-weighted average
        const resolved = this.resolveConflict(contributions);
        (fused as unknown as Record<string, unknown>)[field] = resolved.value;
        
        if (contributions.some(c => c.value !== resolved.value)) {
          conflicts.push({
            field,
            values: contributions.map(c => c.value),
            agents: contributions.map(c => c.agent),
            resolution: `Confidence-weighted: ${resolved.agent} won with ${resolved.confidence}`
          });
        }
      }
    });

    fused.updatedAt = new Date();
    fused.version = (fused.version || 0) + 1;

    return { fusedCompany: fused, conflicts };
  }

  private resolveConflict(
    contributions: { value: unknown; agent: AgentType; confidence: number }[]
  ): { value: unknown; agent: AgentType; confidence: number } {
    // For numbers: weighted average
    // For strings: highest confidence wins
    // For objects: recursive merge
    
    const firstValue = contributions[0].value;
    
    if (typeof firstValue === 'number') {
      const totalWeight = contributions.reduce((sum, c) => sum + c.confidence, 0);
      const weightedSum = contributions.reduce((sum, c) => {
        return sum + (c.value as number) * c.confidence;
      }, 0);
      
      const winner = contributions.reduce((max, c) => 
        c.confidence > max.confidence ? c : max
      );
      
      return {
        value: weightedSum / totalWeight,
        agent: winner.agent,
        confidence: winner.confidence
      };
    }
    
    // For non-numeric: highest confidence wins
    return contributions.reduce((max, c) => 
      c.confidence > max.confidence ? c : max
    );
  }

  private calculateConfidence(results: AgentResult[]): number {
    if (results.length === 0) return 0;
    
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length === 0) return 0;
    
    const avgConfidence = successfulResults.reduce((sum, r) => sum + r.confidence, 0) 
      / successfulResults.length;
    
    const successRate = successfulResults.length / results.length;
    
    return avgConfidence * successRate;
  }

  // 2030: Run thousands of swarms in parallel
  async executeBatch(
    jobs: { company: Company; job: EnrichmentJob }[]
  ): Promise<SwarmResult[]> {
    logger.info(`Executing batch of ${jobs.length} swarms`);
    
    // NO RATE LIMITING - Run everything in parallel
    const promises = jobs.map(({ company, job }) => 
      this.executeSwarm(company, job)
    );
    
    return Promise.all(promises);
  }
}

// Agent Handler Interface
export interface AgentHandler {
  execute(company: Company, config: Record<string, unknown>): Promise<AgentResult>;
}
