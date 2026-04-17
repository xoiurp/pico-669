import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const endpoint =
  process.env.CLOUDFLARE_R2_ENDPOINT ||
  (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

export const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET || "";
export const R2_PUBLIC_URL = (process.env.CLOUDFLARE_R2_PUBLIC_URL || "").replace(/\/$/, "");

export function isR2Configured() {
  return Boolean(endpoint && accessKeyId && secretAccessKey && R2_BUCKET && R2_PUBLIC_URL);
}

let cachedClient: S3Client | null = null;

export function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Cloudflare R2 nao configurado. Defina CLOUDFLARE_R2_ENDPOINT, CLOUDFLARE_R2_ACCESS_KEY_ID e CLOUDFLARE_R2_SECRET_ACCESS_KEY."
    );
  }
  cachedClient = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
  return cachedClient;
}

export async function uploadToR2(opts: {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}): Promise<{ url: string; key: string }> {
  if (!R2_BUCKET) {
    throw new Error("CLOUDFLARE_R2_BUCKET nao configurado.");
  }
  if (!R2_PUBLIC_URL) {
    throw new Error("CLOUDFLARE_R2_PUBLIC_URL nao configurado.");
  }

  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: opts.key,
      Body: opts.body,
      ContentType: opts.contentType,
      CacheControl: opts.cacheControl || "public, max-age=31536000, immutable",
    })
  );

  return {
    key: opts.key,
    url: `${R2_PUBLIC_URL}/${opts.key}`,
  };
}
