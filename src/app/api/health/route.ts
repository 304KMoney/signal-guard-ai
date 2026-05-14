import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const checks: Record<string, string> = {}

  // DB check
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'ok'
  } catch {
    checks.database = 'error — DATABASE_URL not configured or unreachable'
  }

  // Env checks (presence only — never log values)
  checks.anthropic = process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing'
  checks.clerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'configured' : 'missing'
  checks.demoUserId = process.env.DEMO_USER_ID ?? 'using default'

  const allOk = checks.database === 'ok'
  return NextResponse.json(
    { status: allOk ? 'ok' : 'degraded', checks, ts: new Date().toISOString() },
    { status: allOk ? 200 : 503 }
  )
}
