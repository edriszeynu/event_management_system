import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(["ATTENDEE"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { isRead: true },
  });

  if (result.count === 0) return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
