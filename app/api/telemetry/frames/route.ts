import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";

import { prisma } from "../../../../lib/prisma";

const MAX_BODY_BYTES = 64 * 1024;

// Placeholder ingest endpoint. The payload shape is still being prototyped, so
// this intentionally does NOT validate a schema — it best-effort maps a few
// known fields and stores the entire body in `raw`. Only the auth wrapper is
// locked down.
export async function POST(request: NextRequest) {
  const expected = process.env.TELEMETRY_INGEST_TOKEN;
  if (expected) {
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      request.headers.get("x-telemetry-token") ||
      "";
    if (!tokensMatch(token, expected)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    // Fail closed in production only: an unauthenticated write endpoint would
    // let anyone flood the database. In development, allow token-less writes so
    // the payload can be prototyped freely.
    return NextResponse.json({ ok: false, error: "ingest_not_configured" }, { status: 503 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const frame = await prisma.telemetryFrame.create({
    data: {
      receivedAt: new Date(),
      groundStation: stringValue(pick(body.ground_station, body.groundStation)),
      packetKind: stringValue(pick(body.packet_kind, body.packetKind)) || "telemetry",
      sequenceNumber: intValue(pick(body.sequence_number, body.sequenceNumber)),
      rocketTimeMs: bigintValue(pick(body.rocket_time_ms, body.rocketTimeMs)),
      altitudeM: numberValue(pick(body.altitude_m, body.altitudeM)),
      velocityMps: numberValue(pick(body.velocity_mps, body.velocityMps)),
      accelerationMps2: numberValue(pick(body.acceleration_mps2, body.accelerationMps2)),
      latitude: numberValue(body.latitude),
      longitude: numberValue(body.longitude),
      batteryV: numberValue(pick(body.battery_v, body.batteryV)),
      temperatureC: numberValue(pick(body.temperature_c, body.temperatureC)),
      pressurePa: numberValue(pick(body.pressure_pa, body.pressurePa)),
      rssiDbm: numberValue(pick(body.rssi_dbm, body.rssiDbm)),
      raw: body as Prisma.InputJsonValue,
      createdAt: new Date(),
    },
  });
  return NextResponse.json({ ok: true, id: frame.id.toString() }, { status: 201 });
}

function tokensMatch(provided: string, expected: string) {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual requires equal lengths; comparing lengths first leaks only
  // the length, not the contents.
  return a.length === b.length && timingSafeEqual(a, b);
}

// Returns the first value that is actually present, so a legitimate 0 / false
// is preserved instead of being discarded by `||`.
function pick(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null);
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function intValue(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function bigintValue(value: unknown) {
  const parsed = intValue(value);
  return parsed == null ? null : BigInt(parsed);
}
