import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const USER_ID = process.env.DEMO_USER_ID ?? 'demo_user_kiel_green'

export async function GET() {
  try {
    let settings = await prisma.userSettings.findUnique({ where: { userId: USER_ID } })
    if (!settings) {
      settings = await prisma.userSettings.create({ data: { userId: USER_ID } })
    }
    return NextResponse.json(settings)
  } catch (err) {
    console.error('[GET /api/settings]', err)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const settings = await prisma.userSettings.upsert({
      where: { userId: USER_ID },
      update: body,
      create: { userId: USER_ID, ...body },
    })
    return NextResponse.json(settings)
  } catch (err) {
    console.error('[PATCH /api/settings]', err)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
