import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "feedback endpoint" });
}
export async function POST() {
  return NextResponse.json({ message: "feedback created" });
}
export async function PUT() {
  return NextResponse.json({ message: "feedback updated" });
}
export async function DELETE() {
  return NextResponse.json({ message: "feedback deleted" });
}
