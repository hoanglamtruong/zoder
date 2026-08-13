import { Client } from "minio";

const globalForMinio = globalThis as unknown as {
  minioClient: Client | undefined;
  minioBucketReady: Promise<void> | undefined;
};

export const BUCKET = process.env.MINIO_BUCKET ?? "zoder-media";

export const minioClient =
  globalForMinio.minioClient ??
  new Client({
    endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
    port: Number(process.env.MINIO_PORT ?? 8097),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ROOT_USER ?? "",
    secretKey: process.env.MINIO_ROOT_PASSWORD ?? "",
  });

if (process.env.NODE_ENV !== "production") globalForMinio.minioClient = minioClient;

export async function ensureBucket() {
  if (!globalForMinio.minioBucketReady) {
    globalForMinio.minioBucketReady = (async () => {
      const exists = await minioClient.bucketExists(BUCKET).catch(() => false);
      if (!exists) {
        await minioClient.makeBucket(BUCKET);
      }
    })();
  }
  return globalForMinio.minioBucketReady;
}
