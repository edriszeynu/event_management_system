import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const uploadDirectory = path.join(process.cwd(), "public", "uploads", "events");

function detectImageType(bytes: Uint8Array) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).toString() === "137,80,78,71,13,10,26,10") {
    return { extension: "png", mimeType: "image/png" };
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: "jpg", mimeType: "image/jpeg" };
  }
  if (
    bytes.length >= 12 &&
    Buffer.from(bytes.subarray(0, 4)).toString() === "RIFF" &&
    Buffer.from(bytes.subarray(8, 12)).toString() === "WEBP"
  ) {
    return { extension: "webp", mimeType: "image/webp" };
  }
  return null;
}

export async function POST(request: Request) {
  const organizer = await getAuthenticatedUser(["ORGANIZER"]);
  if (!organizer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const organizerId = organizer.id;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image must be between 1 byte and 5 MB." }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const imageType = detectImageType(bytes);
    if (!imageType) {
      return NextResponse.json({ error: "Only PNG, JPG, and WebP images are supported." }, { status: 400 });
    }

    const filename = `${organizerId}-${randomUUID()}.${imageType.extension}`;
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(path.join(uploadDirectory, filename), bytes, { flag: "wx" });

    return NextResponse.json({ url: `/uploads/events/${filename}`, mimeType: imageType.mimeType });
  } catch {
    return NextResponse.json({ error: "Could not save the image. Please try again." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const organizer = await getAuthenticatedUser(["ORGANIZER"]);
  if (!organizer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const organizerId = organizer.id;

  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || !("url" in body) || typeof body.url !== "string") {
      return NextResponse.json({ error: "Invalid image path." }, { status: 400 });
    }

    const filename = path.basename(body.url);
    if (!filename.startsWith(`${organizerId}-`) || !/^.+-[0-9a-f-]{36}\.(png|jpg|webp)$/.test(filename)) {
      return NextResponse.json({ error: "Invalid image path." }, { status: 400 });
    }

    try {
      await unlink(path.join(uploadDirectory, filename));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not remove the image." }, { status: 500 });
  }
}