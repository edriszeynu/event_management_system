import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '../_auth';

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const category = await prisma.category.create({ data: body });
  return NextResponse.json(category, { status: 201 });
}
