/**
 * Claude AI integration for Signal Guard AI
 * All calls are wrapped in try/catch — graceful degradation if API unavailable
 */

import Anthropic from "@anthropic-ai/sdk";

function getClient(userApiKey?: string): Anthropic {
  const apiKey = userApiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("No Anthropic API key configured. Add one in Settings.");
  }
  return new Anthropic({ apiKey });
}

export const DISCLAIMER =
  "⚠️ AI-generated decision support only. Not financial advice. All trades are your responsibility.";

/**
 * Generate morning market brief from check-in answers + mock market data
 */
export async function generateMorningBrief(
  checkInAnswers: Record<string, string | number | boolean>,
  marketData: {
    spyPremarket?: number;
    qqqPremarket?: number;
    btc24h?: number;
    eth24h?: number;
    vix?: number;
    events?: string[];
  },
  accountSize: number,
  tradingMode: string,
  userApiKey?: string
): Promise<{
  narrative: string;
  marketBias: "BULLISH" | "BEARISH" | "NEUTRAL" | "NO_TRADE";
  disclaimer: string;
}> {
  try {
    const client = getClient(userApiKey);

    const systemPrompt = `You are a professional trading coach generating a morning market briefing. Analyze the pre-market conditions provided and give a clear market bias with reasoning. Be concise. Never predict with certainty. Always note key risks.

Output a JSON object with these fields:
{
  "market_bias": "BULLISH|BEARISH|NEUTRAL|NO_TRADE",
  "narrative": "2-3 paragraph market briefing in plain English",
  "key_risks": ["risk1", "risk2"],
  "best_window": "HH:MM AM – HH:MM AM ET"
}

Rules:
- Call NO_TRADE if: VIX > 30, major data release before open, futures down >1%, or multiple contradicting signals
- Never promise profit
- Be conservative — "no trade today" is always valid`;

    const userMessage = `Morning Check-In Answers:
${JSON.stringify(checkInAnswers, null, 2)}

Market Data:
- SPY premarket: ${marketData.spyPremarket ?? "N/A"}%
- QQQ premarket: ${marketData.qqqPremarket ?? "N/A"}%  
- BTC 24h change: ${marketData.btc24h ?? "N/A"}%
- ETH 24h change: ${marketData.eth24h ?? "N/A"}%
- VIX: ${marketData.vix ?? "N/A"}
- High-impact events today: ${marketData.events?.join(", ") || "None"}

Account: $${accountSize} | Mode: ${tradingMode}`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: userMessage }],
      system: systemPrompt,
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Parse JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from Claude response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const bias = (parsed.market_bias as string)?.toUpperCase();
    const validBiases = ["BULLISH", "BEARISH", "NEUTRAL", "NO_TRADE"];

    return {
      narrative: parsed.narrative || content.text,
      marketBias: (validBiases.includes(bias) ? bias : "NEUTRAL") as
        | "BULLISH"
        | "BEARISH"
        | "NEUTRAL"
        | "NO_TRADE",
      disclaimer: DISCLAIMER,
    };
  } catch (error) {
    console.error("Claude morning brief error:", error);
    return {
      narrative: `Unable to generate AI briefing. ${error instanceof Error ? error.message : "Please check your API key in Settings."}\n\nDefault recommendation: Review market conditions manually before trading.`,
      marketBias: "NEUTRAL",
      disclaimer: DISCLAIMER,
    };
  }
}

/**
 * Generate EOD review for a completed trade
 */
export async function generateEODReview(
  trade: {
    ticker: string;
    direction: string;
    entryPrice: number;
    exitPrice?: number | null;
    stopLoss: number;
    target: number;
    pnl?: number | null;
    notes?: string | null;
    size: number;
    mode: string;
  },
  userApiKey?: string
): Promise<{
  narrative: string;
  lessonsLearned: string;
  disclaimer: string;
}> {
  try {
    const client = getClient(userApiKey);

    const systemPrompt = `Review this trade objectively. What went well? What could be improved? What rule, if any, was broken? Give 3 actionable lessons.

Be honest and constructive. A disciplined losing trade is better than a reckless winner.

Output JSON:
{
  "narrative": "Overall assessment of the trade (2-3 paragraphs)",
  "lessons": ["Lesson 1", "Lesson 2", "Lesson 3"],
  "what_went_well": "...",
  "what_to_improve": "..."
}`;

    const userMessage = `Trade Review:
Ticker: ${trade.ticker}
Direction: ${trade.direction}
Entry: $${trade.entryPrice}
Exit: ${trade.exitPrice ? `$${trade.exitPrice}` : "Still open"}
Stop Loss: $${trade.stopLoss}
Target: $${trade.target}
Size: ${trade.size} units
P&L: ${trade.pnl !== null && trade.pnl !== undefined ? `$${trade.pnl}` : "N/A"}
Mode: ${trade.mode}
Notes: ${trade.notes || "None"}`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: userMessage }],
      system: systemPrompt,
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        narrative: content.text,
        lessonsLearned: "Review your journal notes and identify patterns.",
        disclaimer: DISCLAIMER,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const lessons = Array.isArray(parsed.lessons)
      ? parsed.lessons.join("\n")
      : parsed.lessons || "";

    return {
      narrative: parsed.narrative || content.text,
      lessonsLearned: lessons,
      disclaimer: DISCLAIMER,
    };
  } catch (error) {
    console.error("Claude EOD review error:", error);
    return {
      narrative: `Unable to generate AI review. ${error instanceof Error ? error.message : "Check your API key in Settings."}`,
      lessonsLearned:
        "1. Review your entry timing\n2. Check if you followed your plan\n3. Assess emotional state during trade",
      disclaimer: DISCLAIMER,
    };
  }
}
