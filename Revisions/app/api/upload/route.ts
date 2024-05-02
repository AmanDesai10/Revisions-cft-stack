import { S3 } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  if (!process.env.AWS_BUCKET_NAME) {
    return new Response(
      "Missing BLOB_READ_WRITE_TOKEN. Don't forget to add that to your .env file.",
      {
        status: 401,
      },
    );
  }

  const file = req.body || "";
  const contentType = req.headers.get("content-type") || "text/plain";
  const filename = `${nanoid()}.${contentType.split("/")[1]}`;
  const client = new S3({
    region: process.env.AWS_REGION,
    endpoint: process.env.AWS_BUCKET_ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      sessionToken: process.env.AWS_SESSION_TOKEN || "",
    },
  });
  if (!file) {
    return NextResponse.json({
      message: "No file provided",
    });
  }
  await client.putObject({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    Body: await streamToBuffer(file),
    ContentType: contentType,
  });

  return NextResponse.json({
    url: `${process.env.AWS_CLOUDFRONT_URL}/${filename}`,
  });
}

async function streamToBuffer(
  readableStream: ReadableStream<Uint8Array>,
): Promise<Buffer> {
  const reader = readableStream.getReader();
  const chunks = [];
  let result;

  while (true) {
    result = await reader.read();
    if (result.done) {
      break;
    }
    chunks.push(result.value);
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
}
