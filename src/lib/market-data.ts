// Signal Guard AI — Market Data Fetcher
// Sources: Yahoo Finance (unofficial) + CoinGecko (free, no key)
// All data is delayed/approximate — for educational signal generation only

export interface TickerSnapshot {
  ticker: string
  price: number
  previousClose: number
  changePercent: number
  volume: number
  high: number
  low: number
}

export interface CryptoSnapshot {
  id: string
  symbol: string
  price: number
  change24h: number
}

export interface MarketOverview {
  spy: TickerSnapshot | null
  qqq: TickerSnapshot | null
  vix: number | null
  btc: CryptoSnapshot | null
  eth: CryptoSnapshot | null
  timestamp: string
}

// Fetch a single ticker from Yahoo Finance unofficial API
export async function fetchTickerSnapshot(ticker: string): Promise<TickerSnapshot | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=2d`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 300 },  // cache 5 minutes
    })
    if (!res.ok) return null
    const data = await res.json()
    const result = data?.chart?.result?.[0]
    if (!result) return null
    const meta = result.meta
    const quotes = result.indicators?.quote?.[0]
    const closes = result.timestamp
    if (!meta || !closes) return null

    const currentPrice = meta.regularMarketPrice ?? meta.chartPreviousClose
    const previousClose = meta.chartPreviousClose ?? meta.previousClose
    const changePercent = previousClose
      ? ((currentPrice - previousClose) / previousClose) * 100
      : 0

    return {
      ticker,
      price: currentPrice,
      previousClose,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: meta.regularMarketVolume ?? 0,
      high: meta.regularMarketDayHigh ?? currentPrice,
      low: meta.regularMarketDayLow ?? currentPrice,
    }
  } catch {
    return null
  }
}

// Fetch VIX level
export async function fetchVix(): Promise<number | null> {
  const snap = await fetchTickerSnapshot('^VIX')
  return snap?.price ?? null
}

// Fetch BTC + ETH from CoinGecko (no API key required)
export async function fetchCryptoPrices(): Promise<{ btc: CryptoSnapshot | null; eth: CryptoSnapshot | null }> {
  try {
    const url =
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return { btc: null, eth: null }
    const data = await res.json()
    return {
      btc: {
        id: 'bitcoin',
        symbol: 'BTC',
        price: data.bitcoin?.usd ?? 0,
        change24h: Math.round((data.bitcoin?.usd_24h_change ?? 0) * 100) / 100,
      },
      eth: {
        id: 'ethereum',
        symbol: 'ETH',
        price: data.ethereum?.usd ?? 0,
        change24h: Math.round((data.ethereum?.usd_24h_change ?? 0) * 100) / 100,
      },
    }
  } catch {
    return { btc: null, eth: null }
  }
}

// Aggregate full market overview
export async function fetchMarketOverview(): Promise<MarketOverview> {
  const [spy, qqq, vix, crypto] = await Promise.all([
    fetchTickerSnapshot('SPY'),
    fetchTickerSnapshot('QQQ'),
    fetchVix(),
    fetchCryptoPrices(),
  ])
  return {
    spy,
    qqq,
    vix,
    btc: crypto.btc,
    eth: crypto.eth,
    timestamp: new Date().toISOString(),
  }
}

// Classify market bias from data
export function classifyMarketBias(overview: MarketOverview): {
  bias: 'bullish' | 'bearish' | 'neutral' | 'no_trade'
  reason: string
  noTradeReasons: string[]
} {
  const noTradeReasons: string[] = []

  if (overview.vix && overview.vix > 30) {
    noTradeReasons.push(`VIX at ${overview.vix.toFixed(1)} — extreme fear. Avoid trading.`)
  }

  const spyChange = overview.spy?.changePercent ?? 0
  const qqqChange = overview.qqq?.changePercent ?? 0

  if (spyChange < -1.5 && qqqChange < -1.5) {
    noTradeReasons.push('Both SPY and QQQ down more than 1.5% — broad market selloff')
  }

  if (noTradeReasons.length > 0) {
    return { bias: 'no_trade', reason: noTradeReasons[0], noTradeReasons }
  }

  const avgChange = (spyChange + qqqChange) / 2

  if (avgChange > 0.3) return { bias: 'bullish', reason: `SPY ${spyChange > 0 ? '+' : ''}${spyChange}%, QQQ ${qqqChange > 0 ? '+' : ''}${qqqChange}%`, noTradeReasons: [] }
  if (avgChange < -0.3) return { bias: 'bearish', reason: `SPY ${spyChange}%, QQQ ${qqqChange}%`, noTradeReasons: [] }
  return { bias: 'neutral', reason: 'Flat market — wait for direction', noTradeReasons: [] }
}

// High-impact news dates (static — TODO: replace with live economic calendar API)
export function getHighImpactEventsToday(): string[] {
  // In production, fetch from Econoday or MarketWatch calendar
  // For MVP, return a reminder to check manually
  return [
    '⚠️ Check investing.com/economic-calendar for today\'s scheduled events',
    'Key events to watch: FOMC, CPI, NFP, PPI, PCE, GDP releases',
  ]
}
