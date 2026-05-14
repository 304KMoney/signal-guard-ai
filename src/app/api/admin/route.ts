import { NextRequest, NextResponse } from 'next/server'

// Admin-only endpoint — protected by bearer token
// Set ADMIN_TOKEN in .env.local — never commit this value

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.replace('Bearer ', '').trim()
  const expected = process.env.ADMIN_TOKEN
  if (!expected) return false
  // Constant-time compare to prevent timing attacks
  if (token.length !== expected.length) return false
  let mismatch = 0
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return mismatch === 0
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({
    status: 'ok',
    message: 'Admin access confirmed',
    env: {
      database: process.env.DATABASE_URL ? 'configured' : 'missing',
      anthropic: process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing',
      clerk: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'configured' : 'missing',
      demoUserId: process.env.DEMO_USER_ID ?? 'not set',
    },
    ts: new Date().toISOString(),
  })
}
