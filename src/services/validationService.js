/**
 * Validation Service for UiPath API Workflows Learning Platform
 *
 * This service validates that users are correctly using API Workflows
 * by tracking their API calls and validating against scenario requirements
 */

class ValidationService {
  constructor(db) {
    this.db = db;
    this.validationRules = this.initializeValidationRules();
  }

  /**
   * Initialize validation rules for each scenario
   */
  initializeValidationRules() {
    return {
      'hr-onboarding-basic': {
        steps: {
          'setup': {
            requiredAPICalls: [
              { endpoint: '/api/hr/workers', method: 'GET', minCalls: 1 }
            ],
            optionalAPICalls: [
              { endpoint: '/health', method: 'GET' }
            ],
            validationLogic: (tracking) => {
              const hasWorkerCall = tracking.some(t =>
                t.endpoint === '/api/hr/workers' && t.method === 'GET'
              );

              return {
                passed: hasWorkerCall,
                score: hasWorkerCall ? 100 : 0,
                feedback: hasWorkerCall
                  ? 'Great! You successfully connected to the HR Workers API.'
                  : 'You need to call the GET /api/hr/workers endpoint to retrieve employee data.',
                achievements: hasWorkerCall ? ['API_CONNECTED'] : []
              };
            }
          },
          'workflow': {
            requiredAPICalls: [
              { endpoint: '/api/hr/workers', method: 'GET', minCalls: 1 },
              { endpoint: '/api/hr/onboardings', method: 'POST', minCalls: 1 }
            ],
            validationLogic: (tracking) => {
              const hasWorkerCall = tracking.some(t =>
                t.endpoint === '/api/hr/workers' && t.method === 'GET'
              );
              const hasOnboardingCall = tracking.some(t =>
                t.endpoint === '/api/hr/onboardings' && t.method === 'POST'
              );
              const hasCorrectSequence = this.validateSequence(tracking,
                ['/api/hr/workers', '/api/hr/onboardings']
              );

              let score = 0;
              let feedback = [];
              let achievements = [];

              if (hasWorkerCall) {
                score += 40;
                feedback.push('✓ Retrieved employee data');
                achievements.push('DATA_RETRIEVED');
              }

              if (hasOnboardingCall) {
                score += 40;
                feedback.push('✓ Created onboarding task');
                achievements.push('TASK_CREATED');
              }

              if (hasCorrectSequence) {
                score += 20;
                feedback.push('✓ Correct workflow sequence');
                achievements.push('WORKFLOW_MASTER');
              }

              return {
                passed: score >= 80,
                score,
                feedback: feedback.length > 0
                  ? feedback.join(', ')
                  : 'You need to retrieve workers and create onboarding tasks',
                achievements
              };
            }
          }
        }
      },
      'finance-approval-intermediate': {
        steps: {
          'rules': {
            requiredAPICalls: [
              { endpoint: '/api/finance/invoices', method: 'GET', minCalls: 1 }
            ],
            validationLogic: (tracking) => {
              const hasInvoiceCall = tracking.some(t =>
                t.endpoint === '/api/finance/invoices' && t.method === 'GET'
              );
              const hasFilterParams = tracking.some(t =>
                t.endpoint.includes('/api/finance/invoices') &&
                (t.queryParams?.status === 'pending' || t.queryParams?.amount)
              );

              let score = hasInvoiceCall ? 60 : 0;
              if (hasFilterParams) score += 40;

              return {
                passed: score >= 60,
                score,
                feedback: hasFilterParams
                  ? 'Excellent! You\'re filtering invoices based on business rules.'
                  : hasInvoiceCall
                    ? 'Good start! Consider filtering by status or amount.'
                    : 'Retrieve pending invoices to begin approval workflow.',
                achievements: hasFilterParams ? ['RULE_MASTER'] : []
              };
            }
          }
        }
      }
    };
  }

  /**
   * Track an API call made by the user's workflow
   */
  trackAPICall(userId, scenarioId, apiCall) {
    const tracking = {
      userId,
      scenarioId,
      endpoint: apiCall.endpoint,
      method: apiCall.method,
      statusCode: apiCall.statusCode,
      timestamp: new Date().toISOString(),
      queryParams: apiCall.queryParams || {},
      headers: this.sanitizeHeaders(apiCall.headers),
      responseTime: apiCall.responseTime
    };

    // Store in activity_tracking collection
    this.db.activity_tracking.push(tracking);

    // Keep only last 100 entries per user-scenario pair
    const userScenarioTracking = this.db.activity_tracking.filter(t =>
      t.userId === userId && t.scenarioId === scenarioId
    );

    if (userScenarioTracking.length > 100) {
      const toRemove = userScenarioTracking.slice(0, userScenarioTracking.length - 100);
      toRemove.forEach(item => {
        const index = this.db.activity_tracking.indexOf(item);
        if (index > -1) {
          this.db.activity_tracking.splice(index, 1);
        }
      });
    }

    return tracking;
  }

  /**
   * Validate user's progress for a specific scenario step
   */
  validateStep(userId, scenarioId, stepId) {
    const rules = this.validationRules[scenarioId]?.steps[stepId];
    if (!rules) {
      return {
        passed: false,
        score: 0,
        feedback: 'No validation rules defined for this step',
        achievements: []
      };
    }

    // Get user's tracked API calls for this scenario
    const userTracking = this.db.activity_tracking.filter(t =>
      t.userId === userId && t.scenarioId === scenarioId
    );

    // Run validation logic
    const result = rules.validationLogic(userTracking);

    // Store validation result
    const validationRecord = {
      userId,
      scenarioId,
      stepId,
      result,
      timestamp: new Date().toISOString()
    };

    // You could store this in a validation_results collection if needed

    return result;
  }

  /**
   * Check if API calls were made in the correct sequence
   */
  validateSequence(tracking, expectedSequence) {
    const actualSequence = tracking
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(t => t.endpoint);

    let sequenceIndex = 0;
    for (const call of actualSequence) {
      if (call === expectedSequence[sequenceIndex]) {
        sequenceIndex++;
        if (sequenceIndex === expectedSequence.length) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Sanitize headers to remove sensitive information
   */
  sanitizeHeaders(headers) {
    if (!headers) return {};

    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Get validation hints for a step
   */
  getValidationHints(scenarioId, stepId) {
    const rules = this.validationRules[scenarioId]?.steps[stepId];
    if (!rules || !rules.requiredAPICalls) {
      return [];
    }

    return rules.requiredAPICalls.map(call => ({
      type: 'requirement',
      description: `Call ${call.method} ${call.endpoint}${call.minCalls > 1 ? ` at least ${call.minCalls} times` : ''}`,
      endpoint: call.endpoint,
      method: call.method
    }));
  }

  /**
   * Generate a completion certificate for a scenario
   */
  generateCertificate(userId, scenarioId) {
    const scenario = this.db.learning_scenarios.find(s => s.id === scenarioId);
    if (!scenario) return null;

    const tracking = this.db.activity_tracking.filter(t =>
      t.userId === userId && t.scenarioId === scenarioId
    );

    const totalAPICalls = tracking.length;
    const uniqueEndpoints = [...new Set(tracking.map(t => t.endpoint))].length;
    const avgResponseTime = tracking.reduce((sum, t) => sum + (t.responseTime || 0), 0) / tracking.length;

    return {
      certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      scenarioId,
      scenarioTitle: scenario.title,
      completedAt: new Date().toISOString(),
      metrics: {
        totalAPICalls,
        uniqueEndpoints,
        avgResponseTime: Math.round(avgResponseTime),
        difficulty: scenario.difficulty
      },
      achievements: this.calculateAchievements(tracking, scenario)
    };
  }

  /**
   * Calculate achievements based on user's performance
   */
  calculateAchievements(tracking, scenario) {
    const achievements = [];

    // Speed achievement
    const avgResponseTime = tracking.reduce((sum, t) => sum + (t.responseTime || 0), 0) / tracking.length;
    if (avgResponseTime < 100) {
      achievements.push('SPEED_DEMON');
    }

    // Efficiency achievement
    if (tracking.length < scenario.steps.length * 3) {
      achievements.push('EFFICIENT_CODER');
    }

    // Explorer achievement
    const uniqueEndpoints = [...new Set(tracking.map(t => t.endpoint))].length;
    if (uniqueEndpoints > 5) {
      achievements.push('API_EXPLORER');
    }

    return achievements;
  }
}

module.exports = ValidationService;