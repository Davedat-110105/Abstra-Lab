import { NextResponse } from "next/server";

import { getPublicEvents } from "../../../../lib/public-content";

export async function GET() {
  return NextResponse.json({ ok: true, events: await getPublicEvents() });
}
