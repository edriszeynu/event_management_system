import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../_auth';

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Audit logs not yet implemented in schema — return empty
  return NextResponse.json({ logs: [], total: 0 });
}
