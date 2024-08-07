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
  console.log("Getting S3 client", filename);
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
  // try catch

  try {
    console.log("Uploading file");
    await client.putObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filename,
      Body: await streamToBuffer(file),
      ContentType: contentType,
    });
  } catch (error) {
    console.error("Error uploading file", error);
    return NextResponse.json({
      message: "Error uploading file",
    });
  }
  console.log("File uploaded");

  // uncomment if cloudfront is enabled else use the presigned url
  // return NextResponse.json({
  //   url: `${process.env.AWS_CLOUDFRONT_URL}/${filename}`,
  // });

  let url;
  try {
    const response = await fetch(process.env.AWS_APIGATEWAY_URL + "/presignedurl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: filename }),
    });
    console.log(response.statusText);
    if (!response.ok) {
      throw new Error("Failed to get URL from API");
    }

    const data = await response.json();
    console.log("Data", data);
    url = JSON.parse(data.body);

  } catch (error) {
    console.error("Error calling API", error);
    return NextResponse.json({ message: "Error getting URL from API" });
  }
  console.log("URL", url);
  return NextResponse.json({ url: url });
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
