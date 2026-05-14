/**
 * Signal Guard AI — Risk Rules Engine
 * Hard rules that flag trade plans. Shows warnings, never auto-blocks.
 * Human always decides.
 */

export interface RiskCheckInput {
  accountSize: number;
  entryPrice: number;
  stopLoss: number;
  positionSize: number;
  rrRatio: number;
  openPositions: number;
  consecutiveLossesToday: number;
  marketOpenTime?: Date; // ET
  hasHighImpactNewsWithin2h?: boolean;
}

export interface RiskCheckResult {
  passed: boolean;
  violations: RiskViolation[];
  warnings: RiskWarning[];
}

export interface RiskViolation {
  ruleId: string;
  ruleName: string;
  description: string;
  severity: "HARD" | "SOFT";
}

export interface RiskWarning {
  ruleId: string;
  message: string;
}

/**
 * RULE 1: Never risk more than 2% of account on any single trade
 */
function checkMaxAccountRisk(input: RiskCheckInput): RiskViolation | null {
  const riskPerShare = Math.abs(input.entryPrice - input.stopLoss);
  const totalRisk = riskPerShare * input.positionSize;
  const maxRisk = input.accountSize * 0.02;

  if (totalRisk > maxRisk) {
    return {
      ruleId: "RULE_001",
      ruleName: "Max Account Risk",
      description: `Trade risks $${totalRisk.toFixed(2)} which exceeds 2% of account ($${maxRisk.toFixed(2)}). Reduce position size.`,
      severity: "HARD",
    };
  }
  return null;
}

/**
 * RULE 2: Max 3 open positions at once
 */
function checkMaxOpenPositions(input: RiskCheckInput): RiskViolation | null {
  if (input.openPositions >= 3) {
    return {
      ruleId: "RULE_002",
      ruleName: "Max Open Positions",
      description: `You already have ${input.openPositions} open positions. Maximum is 3. Close a position before opening a new one.`,
      severity: "HARD",
    };
  }
  return null;
}

/**
 * RULE 3: No trading first 15 min of market open (9:30–9:45 AM ET)
 */
function checkMarketOpenWindow(input: RiskCheckInput): RiskViolation | null {
  if (!input.marketOpenTime) return null;

  const now = new Date();
  const etOffset = -4; // EDT (adjust to -5 for EST)
  const etNow = new Date(now.getTime() + etOffset * 60 * 60 * 1000);
  const etHour = etNow.getUTCHours();
  const etMin = etNow.getUTCMinutes();

  // 9:30 AM to 9:45 AM ET
  const isInOpenWindow =
    (etHour === 9 && etMin >= 30 && etMin < 45);

  if (isInOpenWindow) {
    return {
      ruleId: "RULE_003",
      ruleName: "No Trading at Open",
      description: "It is currently 9:30–9:45 AM ET. Avoid trading in the first 15 minutes of market open due to high volatility and false moves.",
      severity: "HARD",
    };
  }
  return null;
}

/**
 * RULE 4: Stop trading after 2 consecutive losses in a day
 */
function checkConsecutiveLosses(input: RiskCheckInput): RiskViolation | null {
  if (input.consecutiveLossesToday >= 2) {
    return {
      ruleId: "RULE_004",
      ruleName: "Consecutive Loss Limit",
      description: `You have ${input.consecutiveLossesToday} consecutive losses today. Stop trading for the day. Protect your capital and review what happened.`,
      severity: "HARD",
    };
  }
  return null;
}

/**
 * RULE 5: Min R:R ratio of 1.5:1
 */
function checkMinRRRatio(input: RiskCheckInput): RiskViolation | null {
  if (input.rrRatio < 1.5) {
    return {
      ruleId: "RULE_005",
      ruleName: "Minimum R:R Ratio",
      description: `R:R ratio of ${input.rrRatio.toFixed(2)}:1 is below the minimum required 1.5:1. This trade does not offer enough reward for the risk.`,
      severity: "HARD",
    };
  }
  return null;
}

/**
 * RULE 6: No trading during high-impact news events within 2 hours
 */
function checkNewsRisk(input: RiskCheckInput): RiskViolation | null {
  if (input.hasHighImpactNewsWithin2h) {
    return {
      ruleId: "RULE_006",
      ruleName: "High-Impact News Event",
      description: "A high-impact economic event is scheduled within the next 2 hours. Markets may be volatile and unpredictable. Consider waiting for the event to pass.",
      severity: "SOFT",
    };
  }
  return null;
}

/**
 * Main risk check function — runs all rules and returns results
 * Always advisory: shows warnings, human decides
 */
export function runRiskChecks(input: RiskCheckInput): RiskCheckResult {
  const violations: RiskViolation[] = [];
  const warnings: RiskWarning[] = [];

  const checks = [
    checkMaxAccountRisk(input),
    checkMaxOpenPositions(input),
    checkMarketOpenWindow(input),
    checkConsecutiveLosses(input),
    checkMinRRRatio(input),
    checkNewsRisk(input),
  ];

  for (const violation of checks) {
    if (violation) {
      violations.push(violation);
      warnings.push({
        ruleId: violation.ruleId,
        message: violation.description,
      });
    }
  }

  return {
    passed: violations.filter((v) => v.severity === "HARD").length === 0,
    violations,
    warnings,
  };
}

/**
 * Calculate position size from risk parameters
 */
export function calculatePositionSize(
  accountSize: number,
  riskPercent: number,
  entryPrice: number,
  stopLoss: number
): {
  positionSize: number;
  dollarRisk: number;
  maxRiskDollars: number;
} {
  const maxRiskDollars = accountSize * (riskPercent / 100);
  const riskPerUnit = Math.abs(entryPrice - stopLoss);
  
  if (riskPerUnit === 0) {
    return { positionSize: 0, dollarRisk: 0, maxRiskDollars };
  }

  const positionSize = Math.floor(maxRiskDollars / riskPerUnit);
  const dollarRisk = positionSize * riskPerUnit;

  return {
    positionSize,
    dollarRisk,
    maxRiskDollars,
  };
}

/**
 * Calculate R:R ratio
 */
export function calculateRRRatio(
  entryPrice: number,
  stopLoss: number,
  takeProfit: number
): number {
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(takeProfit - entryPrice);
  
  if (risk === 0) return 0;
  return Math.round((reward / risk) * 100) / 100;
}
