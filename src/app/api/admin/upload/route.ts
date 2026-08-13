import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { minioClient, ensureBucket, BUCKET } from "@/lib/minio";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  return file.type.split("/")[1] ?? "bin";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "NO_FILE" }, { status: 400 });
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "UNSUPPORTED_TYPE" }, { status: 415 });
  }
  if (isImage && file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "IMAGE_TOO_LARGE" }, { status: 413 });
  }
  if (isVideo && file.size > MAX_VIDEO_BYTES) {
    return NextResponse.json({ error: "VIDEO_TOO_LARGE" }, { status: 413 });
  }

  await ensureBucket();

  const folder = isImage ? "images" : "videos";
  const key = `products/${folder}/${randomUUID()}.${extensionFor(file)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await minioClient.putObject(BUCKET, key, buffer, buffer.length, {
    "Content-Type": file.type,
  });

  return NextResponse.json({ url: `/api/media/${key}`, kind: isImage ? "image" : "video" });
}
