import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  if (!await getAuthenticatedUser(["ATTENDEE"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ message: "password endpoint" });
}
export async function POST() {
  if (!await getAuthenticatedUser(["ATTENDEE"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ message: "password created" });
}
export async function PUT() {
  if (!await getAuthenticatedUser(["ATTENDEE"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ message: "password updated" });
}
export async function DELETE() {
  if (!await getAuthenticatedUser(["ATTENDEE"])) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ message: "password deleted" });
}
