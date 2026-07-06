import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "profile endpoint" });
}
export async function POST() {
  return NextResponse.json({ message: "profile created" });
}
export async function PUT() {
  return NextResponse.json({ message: "profile updated" });
}
export async function DELETE() {
  return NextResponse.json({ message: "profile deleted" });
}
