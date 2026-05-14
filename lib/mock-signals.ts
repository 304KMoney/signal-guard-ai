/**
 * Mock signal data for Signal Guard AI
 * In production, this would pull from CoinGecko (crypto) + Yahoo Finance stubs (stocks)
 */

export interface MockSignal {
  id: string;
  ticker: string;
  market: "CRYPTO" | "STOCK" | "FUTURES";
  signalType: string;
  score: number;
  entryLow: number;
  entryHigh: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  rrRatio: number;
  direction: "LONG" | "SHORT";
  aiReasoning: string;
  currentPrice?: number;
}

export const MOCK_SIGNALS: MockSignal[] = [
  {
    id: "sig-btc-001",
    ticker: "BTC-USD",
    market: "CRYPTO",
    signalType: "Breakout + VWAP Reclaim",
    score: 84,
    direction: "LONG",
    entryLow: 67200,
    entryHigh: 67800,
    stopLoss: 65500,
    tp1: 71000,
    tp2: 74500,
    rrRatio: 2.1,
    aiReasoning:
      "BTC has reclaimed VWAP on the 4H after a healthy pullback. RSI at 54 with room to run. Daily trend is bullish with higher highs. Volume on the bounce is 1.3x average. Key level at $65,500 is strong support with 3 touches. No major economic events in the next 4 hours.",
  },
  {
    id: "sig-eth-002",
    ticker: "ETH-USD",
    market: "CRYPTO",
    signalType: "Support Bounce + RSI Divergence",
    score: 76,
    direction: "LONG",
    entryLow: 3450,
    entryHigh: 3520,
    stopLoss: 3320,
    tp1: 3750,
    tp2: 3950,
    rrRatio: 1.9,
    aiReasoning:
      "ETH showing bullish RSI divergence on the 1H chart at key support zone $3,450-$3,520. Positive hidden divergence suggests buyers are absorbing supply. MACD crossing above signal line. Volume profile shows significant accumulation at current levels.",
  },
  {
    id: "sig-spy-003",
    ticker: "SPY",
    market: "STOCK",
    signalType: "Trend Continuation + MA Stack",
    score: 78,
    direction: "LONG",
    entryLow: 527.50,
    entryHigh: 529.00,
    stopLoss: 523.00,
    tp1: 536.00,
    tp2: 542.00,
    rrRatio: 2.0,
    aiReasoning:
      "SPY maintaining clean uptrend above all major MAs (20/50/200). Pullback to 20 EMA on declining volume — textbook continuation setup. QQQ showing relative strength. VIX below 15. Best entry on any further weakness toward $527.50 support.",
  },
  {
    id: "sig-aapl-004",
    ticker: "AAPL",
    market: "STOCK",
    signalType: "Earnings Momentum + Breakout",
    score: 71,
    direction: "LONG",
    entryLow: 211.50,
    entryHigh: 213.00,
    stopLoss: 208.00,
    tp1: 219.00,
    tp2: 224.00,
    rrRatio: 1.7,
    aiReasoning:
      "AAPL breaking out above 6-week consolidation range on above-average volume. AI product pipeline news acting as catalyst. Above 20/50/200 MA. RSI at 61 — not overbought. Stop below key structural support at $208.",
  },
];

/**
 * Fetch live CoinGecko prices and overlay on mock signals
 */
export async function getSignalsWithLivePrices(): Promise<MockSignal[]> {
  try {
    const cryptoIds = ["bitcoin", "ethereum"];
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds.join(",")}&vs_currencies=usd`;
    
    const res = await fetch(url, {
      next: { revalidate: 60 }, // cache 60s
    });

    if (!res.ok) {
      return MOCK_SIGNALS;
    }

    const data: Record<string, { usd: number }> = await res.json();

    return MOCK_SIGNALS.map((signal) => {
      if (signal.ticker === "BTC-USD" && data.bitcoin) {
        return { ...signal, currentPrice: data.bitcoin.usd };
      }
      if (signal.ticker === "ETH-USD" && data.ethereum) {
        return { ...signal, currentPrice: data.ethereum.usd };
      }
      return signal;
    });
  } catch {
    return MOCK_SIGNALS;
  }
}

export function getSignalById(id: string): MockSignal | undefined {
  return MOCK_SIGNALS.find((s) => s.id === id);
}

export function getScoreBadgeColor(score: number): string {
  if (score >= 90) return "text-green-400 bg-green-400/10 border-green-400/30";
  if (score >= 80) return "text-orange-400 bg-orange-400/10 border-orange-400/30";
  if (score >= 70) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
  return "text-gray-400 bg-gray-400/10 border-gray-400/30";
}

export function getMarketBiasStyle(bias: string): {
  bg: string;
  text: string;
  label: string;
  emoji: string;
} {
  switch (bias) {
    case "BULLISH":
      return {
        bg: "bg-green-500/10 border-green-500/30",
        text: "text-green-400",
        label: "BULLISH",
        emoji: "⬆",
      };
    case "BEARISH":
      return {
        bg: "bg-red-500/10 border-red-500/30",
        text: "text-red-400",
        label: "BEARISH",
        emoji: "⬇",
      };
    case "NO_TRADE":
      return {
        bg: "bg-orange-900/20 border-orange-500/30",
        text: "text-orange-400",
        label: "NO TRADE DAY",
        emoji: "⛔",
      };
    default:
      return {
        bg: "bg-gray-500/10 border-gray-500/30",
        text: "text-gray-400",
        label: "NEUTRAL",
        emoji: "➡",
      };
  }
}
