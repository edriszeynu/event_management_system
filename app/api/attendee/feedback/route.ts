import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  if (!await getAuthenticatedUser(["ATTENDEE"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ message: "feedback endpoint" });
}
export async function POST() {
  if (!await getAuthenticatedUser(["ATTENDEE"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ message: "feedback created" });
}
export async function PUT() {
  if (!await getAuthenticatedUser(["ATTENDEE"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ message: "feedback updated" });
}
export async function DELETE() {
  if (!await getAuthenticatedUser(["ATTENDEE"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ message: "feedback deleted" });
}
