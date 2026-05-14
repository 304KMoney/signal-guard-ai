// Signal Guard AI — Risk Rules Engine
// 15 hard rules. All must pass before a trade plan can be approved.
// These rules cannot be disabled in MVP mode.

export interface TradePlanInput {
  ticker: string
  marketType: 'stock' | 'crypto' | 'futures'
  riskDollars: number
  rrRatio: number
  signalScore: number
  positionSizeUsd: number
  isOptions?: boolean
  isNearNews?: boolean  // high-impact news within 30 min
  isFuturesNearClose?: boolean
}

export interface TradingState {
  tradesToday: number
  lossesToday: number
  dailyPnl: number
  checkinComplete: boolean
  lastTradeResult?: 'win' | 'loss'
  lastTradeRiskDollars?: number
}

export interface UserRiskSettings {
  accountSize: number       // live: $20 | paper: $500
  maxRiskPct: number        // 0.01 = 1%
  maxTradesDay: number      // default: 2
  maxLossDay: number        // default: 5% of account
  minSignalScore: number    // default: 70
  minRrRatio: number        // default: 2.0
  tradingMode: 'paper' | 'tiny_live'
}

export interface RuleResult {
  ruleId: string
  ruleName: string
  passed: boolean
  message: string
}

export interface RiskCheckResult {
  passed: boolean
  violations: RuleResult[]
  warnings: string[]
}

// ─────────────────────────────────────────────────────────────────
// THE 15 HARD RULES
// ─────────────────────────────────────────────────────────────────

export function runAllRules(
  plan: TradePlanInput,
  state: TradingState,
  settings: UserRiskSettings
): RiskCheckResult {
  const results: RuleResult[] = []
  const warnings: string[] = []

  const maxRisk = settings.accountSize * settings.maxRiskPct  // e.g. $0.20 live / $5.00 paper

  // RULE_001: Manual approval always required (informational — never auto-executes)
  results.push({
    ruleId: 'RULE_001',
    ruleName: 'Manual Approval Required',
    passed: true,
    message: '✅ This system never places trades automatically. You must approve manually.',
  })

  // RULE_002: Max 1% account risk per trade
  const rule002 = plan.riskDollars <= maxRisk
  results.push({
    ruleId: 'RULE_002',
    ruleName: 'Max 1% Account Risk Per Trade',
    passed: rule002,
    message: rule002
      ? `✅ Risk $${plan.riskDollars.toFixed(2)} is within $${maxRisk.toFixed(2)} limit`
      : `❌ Risk $${plan.riskDollars.toFixed(2)} exceeds $${maxRisk.toFixed(2)} max. Reduce position size.`,
  })

  // RULE_003: Max 2 trades per day
  const rule003 = state.tradesToday < settings.maxTradesDay
  results.push({
    ruleId: 'RULE_003',
    ruleName: `Max ${settings.maxTradesDay} Trades Per Day`,
    passed: rule003,
    message: rule003
      ? `✅ ${state.tradesToday}/${settings.maxTradesDay} trades taken today`
      : `❌ Daily trade limit (${settings.maxTradesDay}) reached. No more trades today.`,
  })

  // RULE_004: Stop after 2 losses
  const rule004 = state.lossesToday < 2
  results.push({
    ruleId: 'RULE_004',
    ruleName: 'Stop After 2 Losses',
    passed: rule004,
    message: rule004
      ? `✅ ${state.lossesToday} loss(es) today — still within limit`
      : `❌ 2 losses today. Trading is suspended for the rest of the day.`,
  })

  // RULE_005: Daily loss limit
  const rule005 = state.dailyPnl > -settings.maxLossDay
  results.push({
    ruleId: 'RULE_005',
    ruleName: `Daily Loss Limit ($${settings.maxLossDay.toFixed(2)})`,
    passed: rule005,
    message: rule005
      ? `✅ Daily P&L: $${state.dailyPnl.toFixed(2)} — within limit`
      : `❌ Daily loss limit of $${settings.maxLossDay.toFixed(2)} reached. All trading suspended.`,
  })

  // RULE_006: No averaging down (simplified — flagged as warning since we don't track open positions here)
  results.push({
    ruleId: 'RULE_006',
    ruleName: 'No Averaging Down',
    passed: true,
    message: '✅ Do not add to any losing position. This rule is self-enforced.',
  })

  // RULE_007: Minimum R:R 2:1
  const rule007 = plan.rrRatio >= settings.minRrRatio
  results.push({
    ruleId: 'RULE_007',
    ruleName: `Minimum R:R ${settings.minRrRatio}:1`,
    passed: rule007,
    message: rule007
      ? `✅ R:R of ${plan.rrRatio.toFixed(1)}:1 meets the ${settings.minRrRatio}:1 minimum`
      : `❌ R:R of ${plan.rrRatio.toFixed(1)}:1 is below minimum ${settings.minRrRatio}:1. Skip this trade.`,
  })

  // RULE_008: Minimum signal score 70
  const rule008 = plan.signalScore >= settings.minSignalScore
  results.push({
    ruleId: 'RULE_008',
    ruleName: `Minimum Signal Score ${settings.minSignalScore}`,
    passed: rule008,
    message: rule008
      ? `✅ Signal score ${plan.signalScore}/100 passes`
      : `❌ Signal score ${plan.signalScore}/100 is below minimum ${settings.minSignalScore}. Do not trade.`,
  })

  // RULE_009: No high-impact news within 30 min
  const rule009 = !plan.isNearNews
  results.push({
    ruleId: 'RULE_009',
    ruleName: 'No High-Impact News ±30 Min',
    passed: rule009,
    message: rule009
      ? '✅ No high-impact news events within 30 minutes'
      : '❌ High-impact news within 30 minutes. Wait for the event to pass before entering.',
  })

  // RULE_010: No futures overnight (beginner mode)
  const rule010 = !(plan.marketType === 'futures' && plan.isFuturesNearClose)
  results.push({
    ruleId: 'RULE_010',
    ruleName: 'No Futures Overnight (Beginner Mode)',
    passed: rule010,
    message: rule010
      ? '✅ No overnight futures risk'
      : '❌ Futures positions must be closed before market close in beginner mode.',
  })

  // RULE_011: No full account risk (max 25% per position)
  const maxPositionUsd = settings.accountSize * 0.25
  const rule011 = plan.positionSizeUsd <= maxPositionUsd
  results.push({
    ruleId: 'RULE_011',
    ruleName: `Max 25% Account Per Position ($${maxPositionUsd.toFixed(2)})`,
    passed: rule011,
    message: rule011
      ? `✅ Position size $${plan.positionSizeUsd.toFixed(2)} is within the 25% limit`
      : `❌ Position size $${plan.positionSizeUsd.toFixed(2)} exceeds max $${maxPositionUsd.toFixed(2)}. Reduce shares.`,
  })

  // RULE_012: No options in MVP
  const rule012 = !plan.isOptions
  results.push({
    ruleId: 'RULE_012',
    ruleName: 'No Options Trading (MVP)',
    passed: rule012,
    message: rule012
      ? '✅ Options trading is disabled in MVP mode'
      : '❌ Options trading is not enabled in this version.',
  })

  // RULE_013: No auto-execution (always passes — enforced architecturally)
  results.push({
    ruleId: 'RULE_013',
    ruleName: 'No Auto-Execution (MVP)',
    passed: true,
    message: '✅ Signal Guard AI never executes trades automatically.',
  })

  // RULE_014: No increasing size after a loss
  let rule014 = true
  let rule014Msg = '✅ Position sizing is consistent with last trade'
  if (state.lastTradeResult === 'loss' && state.lastTradeRiskDollars) {
    rule014 = plan.riskDollars <= state.lastTradeRiskDollars
    if (!rule014) {
      rule014Msg = `❌ Last trade was a loss. Cannot increase risk from $${state.lastTradeRiskDollars.toFixed(2)} to $${plan.riskDollars.toFixed(2)}.`
    }
  }
  results.push({
    ruleId: 'RULE_014',
    ruleName: 'No Increasing Size After a Loss',
    passed: rule014,
    message: rule014Msg,
  })

  // RULE_015: Check-in required
  const rule015 = state.checkinComplete
  results.push({
    ruleId: 'RULE_015',
    ruleName: 'Morning Check-In Required',
    passed: rule015,
    message: rule015
      ? '✅ Morning check-in complete'
      : '❌ Complete your morning check-in before approving any trade.',
  })

  // Soft warnings
  if (plan.marketType === 'crypto' && new Date().getDay() === 0) {
    warnings.push('⚠️ Sunday crypto trading — lower liquidity than weekdays')
  }
  if (plan.signalScore >= settings.minSignalScore && plan.signalScore < 75) {
    warnings.push('⚠️ Signal score is borderline (below 75). Consider skipping or using half size.')
  }
  if (state.lossesToday === 1) {
    warnings.push('⚠️ 1 loss today. One more loss suspends trading. Be selective.')
  }

  const violations = results.filter(r => !r.passed)
  return {
    passed: violations.length === 0,
    violations,
    warnings,
  }
}

// Position sizing utility — core math
export function calculatePositionSize(
  accountSize: number,
  riskPct: number,
  entryPrice: number,
  stopPrice: number
): { shares: number; dollarRisk: number; sharesRounded: number } {
  const maxRisk = accountSize * riskPct
  const riskPerShare = Math.abs(entryPrice - stopPrice)
  if (riskPerShare === 0) return { shares: 0, dollarRisk: 0, sharesRounded: 0 }
  const shares = maxRisk / riskPerShare
  return {
    shares,
    sharesRounded: Math.floor(shares * 100) / 100,  // 2 decimal places for fractional
    dollarRisk: shares * riskPerShare,
  }
}

// R:R calculator
export function calculateRR(
  entry: number,
  stop: number,
  target: number,
  direction: 'long' | 'short'
): number {
  const risk = Math.abs(entry - stop)
  const reward = Math.abs(target - entry)
  if (risk === 0) return 0
  return Math.round((reward / risk) * 10) / 10
}
