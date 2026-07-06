import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../_auth';

// Settings are not persisted in DB yet — return defaults
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const category = req.nextUrl.searchParams.get('category') || 'general';
  return NextResponse.json({ category, settings: {} });
}

export async function PUT(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  return NextResponse.json({ success: true, ...body });
}
