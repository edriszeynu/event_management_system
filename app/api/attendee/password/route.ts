import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "password endpoint" });
}
export async function POST() {
  return NextResponse.json({ message: "password created" });
}
export async function PUT() {
  return NextResponse.json({ message: "password updated" });
}
export async function DELETE() {
  return NextResponse.json({ message: "password deleted" });
}
