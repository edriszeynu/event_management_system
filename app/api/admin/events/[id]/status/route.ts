import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '../../../_auth';

const ALLOWED_EVENT_STATUSES = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', 'ARCHIVED'] as const;

async function handleStatusUpdate(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (typeof body !== 'object' || body === null || !('status' in body)) {
    return NextResponse.json({ error: 'Invalid event status' }, { status: 400 });
  }
  const { status } = body as { status?: unknown };

  if (typeof status !== 'string' || !ALLOWED_EVENT_STATUSES.includes(status as typeof ALLOWED_EVENT_STATUSES[number])) {
    return NextResponse.json({ error: 'Invalid event status' }, { status: 400 });
  }

  const event = await prisma.event.update({ where: { id }, data: { status: status as typeof ALLOWED_EVENT_STATUSES[number] } });

  return NextResponse.json(event);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return handleStatusUpdate(req, context);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return handleStatusUpdate(req, context);
}
