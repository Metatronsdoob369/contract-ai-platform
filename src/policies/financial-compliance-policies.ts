/**
 * @file financial-compliance-policies.ts
 * @description Policy rules for financial research domain
 * Integrates with the policy-authoritative orchestrator
 */

export interface PolicyCheck {
  policy: string;
  result: 'pass' | 'fail' | 'warning';
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Financial Data Access Policy
 * Ensures user has appropriate authorization for financial data
 */
export function checkFinancialDataAccess(context: {
  userRole?: string;
  dataType: string;
  sensitivity: 'public' | 'proprietary' | 'insider';
}): PolicyCheck {
  const { userRole, dataType, sensitivity } = context;

  // Insider information requires special authorization
  if (sensitivity === 'insider') {
    if (userRole !== 'authorized_trader' && userRole !== 'compliance_approved') {
      return {
        policy: 'financial_data_access',
        result: 'fail',
        details: `Insider ${dataType} requires authorized_trader or compliance_approved role`,
        severity: 'critical'
      };
    }
  }

  // Proprietary data requires at least analyst role
  if (sensitivity === 'proprietary') {
    if (!userRole || (userRole !== 'analyst' && userRole !== 'authorized_trader')) {
      return {
        policy: 'financial_data_access',
        result: 'fail',
        details: `Proprietary ${dataType} requires analyst or higher role`,
        severity: 'high'
      };
    }
  }

  return {
    policy: 'financial_data_access',
    result: 'pass',
    details: `User authorized for ${sensitivity} ${dataType}`,
    severity: 'low'
  };
}

/**
 * SEC Compliance Policy
 * Ensures compliance with SEC regulations for financial analysis
 */
export function checkSECCompliance(context: {
  reportType: string;
  includesForwardLooking: boolean;
  sourcesDocumented: boolean;
}): PolicyCheck {
  const { reportType, includesForwardLooking, sourcesDocumented } = context;

  // Forward-looking statements require disclaimers
  if (includesForwardLooking && reportType === 'public_recommendation') {
    return {
      policy: 'sec_compliance',
      result: 'warning',
      details: 'Forward-looking statements in public recommendations require SEC disclaimer',
      severity: 'high'
    };
  }

  // All analysis must have documented sources
  if (!sourcesDocumented) {
    return {
      policy: 'sec_compliance',
      result: 'fail',
      details: 'SEC regulations require all financial analysis to document sources',
      severity: 'high'
    };
  }

  return {
    policy: 'sec_compliance',
    result: 'pass',
    details: 'Analysis meets SEC compliance requirements',
    severity: 'low'
  };
}

/**
 * Financial Accuracy Policy
 * Ensures financial data meets accuracy standards
 */
export function checkFinancialAccuracy(context: {
  verificationScore: number;
  sourcesCount: number;
  calculationsVerified: boolean;
}): PolicyCheck {
  const { verificationScore, sourcesCount, calculationsVerified } = context;

  // Verification score must be above threshold
  if (verificationScore < 0.7) {
    return {
      policy: 'financial_accuracy',
      result: 'fail',
      details: `Verification score ${verificationScore} below required 0.7 threshold`,
      severity: 'critical'
    };
  }

  // Multiple sources required for credibility
  if (sourcesCount < 2) {
    return {
      policy: 'financial_accuracy',
      result: 'warning',
      details: 'Financial analysis should cite at least 2 independent sources',
      severity: 'medium'
    };
  }

  // Calculations must be verified
  if (!calculationsVerified) {
    return {
      policy: 'financial_accuracy',
      result: 'warning',
      details: 'Financial calculations have not been independently verified',
      severity: 'medium'
    };
  }

  return {
    policy: 'financial_accuracy',
    result: 'pass',
    details: 'Financial data meets accuracy standards',
    severity: 'low'
  };
}

/**
 * Conflict of Interest Policy
 * Prevents biased financial recommendations
 */
export function checkConflictOfInterest(context: {
  analystHoldings?: string[];
  companyAnalyzed: string;
  disclosureRequired: boolean;
}): PolicyCheck {
  const { analystHoldings, companyAnalyzed, disclosureRequired } = context;

  // Check if analyst has holdings in analyzed company
  if (analystHoldings && analystHoldings.includes(companyAnalyzed)) {
    if (!disclosureRequired) {
      return {
        policy: 'conflict_of_interest',
        result: 'fail',
        details: `Analyst holds ${companyAnalyzed} but conflict not disclosed`,
        severity: 'critical'
      };
    }

    return {
      policy: 'conflict_of_interest',
      result: 'warning',
      details: `Analyst has holdings in ${companyAnalyzed} - disclosure required`,
      severity: 'high'
    };
  }

  return {
    policy: 'conflict_of_interest',
    result: 'pass',
    details: 'No conflicts of interest detected',
    severity: 'low'
  };
}

/**
 * Market Manipulation Prevention Policy
 * Prevents coordinated trading or pump-and-dump schemes
 */
export function checkMarketManipulation(context: {
  analysisType: string;
  distributionChannel: string;
  coordinatedActivity: boolean;
}): PolicyCheck {
  const { analysisType, distributionChannel, coordinatedActivity } = context;

  // Flag coordinated activity
  if (coordinatedActivity) {
    return {
      policy: 'market_manipulation',
      result: 'fail',
      details: 'Coordinated trading activity detected - potential market manipulation',
      severity: 'critical'
    };
  }

  // Public recommendations require extra scrutiny
  if (distributionChannel === 'public' && analysisType === 'strong_buy') {
    return {
      policy: 'market_manipulation',
      result: 'warning',
      details: 'Public strong buy recommendations require compliance review',
      severity: 'high'
    };
  }

  return {
    policy: 'market_manipulation',
    result: 'pass',
    details: 'No market manipulation indicators detected',
    severity: 'low'
  };
}

/**
 * Register all financial policies with the policy engine
 */
export function registerFinancialPolicies(policyEngine: any): void {
  policyEngine.registerPolicy('financial_data_access', checkFinancialDataAccess);
  policyEngine.registerPolicy('sec_compliance', checkSECCompliance);
  policyEngine.registerPolicy('financial_accuracy', checkFinancialAccuracy);
  policyEngine.registerPolicy('conflict_of_interest', checkConflictOfInterest);
  policyEngine.registerPolicy('market_manipulation', checkMarketManipulation);
  
  console.log('[FinancialPolicies] Registered 5 financial compliance policies');
}
