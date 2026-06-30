import { NextResponse } from "next/server";

import { getPublicPosts } from "../../../../lib/public-content";

export async function GET() {
  return NextResponse.json({ ok: true, posts: await getPublicPosts() });
}
