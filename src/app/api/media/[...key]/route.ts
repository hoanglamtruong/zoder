import { Readable } from "stream";
import { minioClient, BUCKET } from "@/lib/minio";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const objectKey = key.join("/");

  try {
    const stat = await minioClient.statObject(BUCKET, objectKey);
    const nodeStream = await minioClient.getObject(BUCKET, objectKey);

    return new Response(Readable.toWeb(nodeStream) as ReadableStream, {
      headers: {
        "Content-Type": stat.metaData?.["content-type"] ?? "application/octet-stream",
        "Content-Length": String(stat.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
