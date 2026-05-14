import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const USER_ID = process.env.DEMO_USER_ID ?? 'demo_user_kiel_green'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const entry = await prisma.journalEntry.findFirst({
      where: { id: params.id, userId: USER_ID },
    })
    if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(entry)
  } catch (err) {
    console.error('[GET /api/journal/[id]]', err)
    return NextResponse.json({ error: 'Failed to load entry' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const entry = await prisma.journalEntry.updateMany({
      where: { id: params.id, userId: USER_ID },
      data: body,
    })
    if (entry.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PATCH /api/journal/[id]]', err)
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await prisma.journalEntry.deleteMany({
      where: { id: params.id, userId: USER_ID },
    })
    if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/journal/[id]]', err)
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
  }
}
