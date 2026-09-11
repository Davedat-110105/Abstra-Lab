import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";

import { prisma } from "../../../../lib/prisma";

const MAX_BODY_BYTES = 64 * 1024;

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
    return NextResponse.json({ ok: false, error: "ingest_not_configured" }, { status: 503 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (Buffer.byteLength(text) > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
    }
    const parsed: unknown = JSON.parse(text);
    if (!isRecord(parsed)) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }
    body = parsed;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const telemetry = isRecord(body.payload) ? body.payload : body;
  const groundStation = stringValue(
    pick(body.station_id, body.ground_station, body.groundStation, telemetry.ground_station, telemetry.groundStation),
  ).trim();
  if (!groundStation) {
    return NextResponse.json({ ok: false, error: "ground_station_required" }, { status: 422 });
  }

  const frame = await prisma.telemetryFrame.create({
    data: {
      receivedAt: new Date(),
      groundStation,
      packetKind: stringValue(pick(body.type, body.packet_kind, body.packetKind, telemetry.packet_kind, telemetry.packetKind)) || "telemetry",
      sequenceNumber: intValue(pick(telemetry.seq, telemetry.sequence_number, telemetry.sequenceNumber)),
      rocketTimeMs: bigintValue(pick(telemetry.rocket_time_ms, telemetry.rocketTimeMs)),
      altitudeM: numberValue(pick(telemetry.alt, telemetry.altitude_m, telemetry.altitudeM)),
      velocityMps: numberValue(pick(telemetry.velocity_mps, telemetry.velocityMps)),
      accelerationMps2: numberValue(pick(telemetry.acceleration_mps2, telemetry.accelerationMps2)),
      latitude: numberValue(telemetry.latitude),
      longitude: numberValue(telemetry.longitude),
      batteryV: numberValue(pick(telemetry.battery_v, telemetry.batteryV)),
      temperatureC: numberValue(pick(telemetry.temperature_c, telemetry.temperatureC)),
      pressurePa: numberValue(pick(telemetry.pressure_pa, telemetry.pressurePa)),
      rssiDbm: numberValue(pick(telemetry.rssi, telemetry.rssi_dbm, telemetry.rssiDbm)),
      raw: body as Prisma.InputJsonValue,
      createdAt: new Date(),
    },
  });
  return NextResponse.json({ ok: true, id: frame.id.toString() }, { status: 201 });
}

function tokensMatch(provided: string, expected: string) {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function pick(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
