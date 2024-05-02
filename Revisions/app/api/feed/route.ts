import { getPostsFeed } from "@/lib/fetchers";
import { NextResponse } from "next/server";

export async function GET(_req: Request) {
  const domain = _req.headers.get("host");
  if (!domain) return NextResponse.json({ status: 400, body: "Bad Request" });
  const feed = await getPostsFeed(domain);
  console.log('[feed]',feed);

  return NextResponse.json({
    message: "success",
    feed,
  });
}
