"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwarmOrchestrator = void 0;
const events_1 = require("events");
const logger_1 = require("../utils/logger");
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
class SwarmOrchestrator extends events_1.EventEmitter {
    agentRegistry;
    activeSwarms;
    constructor() {
        super();
        this.agentRegistry = new Map();
        this.activeSwarms = new Map();
    }
    registerAgent(agentType, handler) {
        this.agentRegistry.set(agentType, handler);
        logger_1.logger.info(`Agent registered: ${agentType}`);
    }
    async executeSwarm(company, job) {
        const startTime = Date.now();
        logger_1.logger.info(`Starting swarm for company: ${company.name}`, {
            companyId: company.id,
            agentCount: job.agents.length
        });
        this.emit('swarm:started', { companyId: company.id, jobId: job.id });
        // 2030: ALL AGENTS RUN IN PARALLEL - No sequential bottlenecks
        const agentPromises = job.agents.map(agentTask => this.executeAgentWithTimeout(agentTask, company, 30000) // 30s timeout per agent
        );
        // Wait for all agents to complete (or fail)
        const agentResults = await Promise.allSettled(agentPromises);
        // Process results
        const results = agentResults.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            }
            else {
                return {
                    agent: job.agents[index].agent,
                    success: false,
                    data: null,
                    confidence: 0,
                    processingTime: 0,
                    error: result.reason?.message || 'Unknown error'
                };
            }
        });
        // Create result map
        const resultMap = new Map();
        results.forEach((result, index) => {
            resultMap.set(job.agents[index].agent, result);
        });
        // FUSION ENGINE: Merge all agent perspectives
        const { fusedCompany, conflicts } = await this.fuseIntelligence(company, results);
        const swarmResult = {
            companyId: company.id,
            agentResults: resultMap,
            fusedResult: fusedCompany,
            confidence: this.calculateConfidence(results),
            conflicts,
            processingTime: Date.now() - startTime
        };
        this.emit('swarm:completed', swarmResult);
        logger_1.logger.info(`Swarm completed for: ${company.name}`, {
            duration: swarmResult.processingTime,
            confidence: swarmResult.confidence,
            conflictCount: conflicts.length
        });
        return swarmResult;
    }
    async executeAgentWithTimeout(task, company, timeoutMs) {
        const handler = this.agentRegistry.get(task.agent);
        if (!handler) {
            throw new Error(`No handler registered for agent: ${task.agent}`);
        }
        const startTime = Date.now();
        return Promise.race([
            handler.execute(company, task.config),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Agent timeout')), timeoutMs))
        ]).then(result => ({
            ...result,
            processingTime: Date.now() - startTime
        }));
    }
    async fuseIntelligence(original, results) {
        const conflicts = [];
        // Start with original data
        const fused = { ...original };
        // Group results by field they contribute to
        const fieldContributions = new Map();
        results.forEach(result => {
            if (!result.success || !result.data)
                return;
            const data = result.data;
            Object.entries(data).forEach(([field, value]) => {
                if (!fieldContributions.has(field)) {
                    fieldContributions.set(field, []);
                }
                fieldContributions.get(field).push({
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
                fused[field] = contributions[0].value;
            }
            else if (contributions.length > 1) {
                // Conflict detected - resolve with confidence-weighted average
                const resolved = this.resolveConflict(contributions);
                fused[field] = resolved.value;
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
    resolveConflict(contributions) {
        // For numbers: weighted average
        // For strings: highest confidence wins
        // For objects: recursive merge
        const firstValue = contributions[0].value;
        if (typeof firstValue === 'number') {
            const totalWeight = contributions.reduce((sum, c) => sum + c.confidence, 0);
            const weightedSum = contributions.reduce((sum, c) => {
                return sum + c.value * c.confidence;
            }, 0);
            const winner = contributions.reduce((max, c) => c.confidence > max.confidence ? c : max);
            return {
                value: weightedSum / totalWeight,
                agent: winner.agent,
                confidence: winner.confidence
            };
        }
        // For non-numeric: highest confidence wins
        return contributions.reduce((max, c) => c.confidence > max.confidence ? c : max);
    }
    calculateConfidence(results) {
        if (results.length === 0)
            return 0;
        const successfulResults = results.filter(r => r.success);
        if (successfulResults.length === 0)
            return 0;
        const avgConfidence = successfulResults.reduce((sum, r) => sum + r.confidence, 0)
            / successfulResults.length;
        const successRate = successfulResults.length / results.length;
        return avgConfidence * successRate;
    }
    // 2030: Run thousands of swarms in parallel
    async executeBatch(jobs) {
        logger_1.logger.info(`Executing batch of ${jobs.length} swarms`);
        // NO RATE LIMITING - Run everything in parallel
        const promises = jobs.map(({ company, job }) => this.executeSwarm(company, job));
        return Promise.all(promises);
    }
}
exports.SwarmOrchestrator = SwarmOrchestrator;
//# sourceMappingURL=SwarmOrchestrator.js.map