import { NextRequest, NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  const expected = process.env.TELEMETRY_INGEST_TOKEN;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || request.headers.get("x-telemetry-token");
  if (expected && token !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const frame = await prisma.telemetryFrame.create({
    data: {
      receivedAt: new Date(),
      groundStation: stringValue(body.ground_station || body.groundStation),
      packetKind: stringValue(body.packet_kind || body.packetKind || "telemetry"),
      sequenceNumber: intValue(body.sequence_number || body.sequenceNumber),
      rocketTimeMs: bigintValue(body.rocket_time_ms || body.rocketTimeMs),
      altitudeM: numberValue(body.altitude_m || body.altitudeM),
      velocityMps: numberValue(body.velocity_mps || body.velocityMps),
      accelerationMps2: numberValue(body.acceleration_mps2 || body.accelerationMps2),
      latitude: numberValue(body.latitude),
      longitude: numberValue(body.longitude),
      batteryV: numberValue(body.battery_v || body.batteryV),
      temperatureC: numberValue(body.temperature_c || body.temperatureC),
      pressurePa: numberValue(body.pressure_pa || body.pressurePa),
      rssiDbm: numberValue(body.rssi_dbm || body.rssiDbm),
      raw: body,
      createdAt: new Date(),
    },
  });
  return NextResponse.json({ ok: true, id: frame.id.toString() }, { status: 201 });
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
