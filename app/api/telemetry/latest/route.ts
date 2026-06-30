import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const frames = await prisma.telemetryFrame.findMany({
    orderBy: { receivedAt: "desc" },
    take: 25,
  });
  return NextResponse.json({ ok: true, frames: frames.map(serializeFrame) });
}

function serializeFrame(frame: {
  id: bigint;
  receivedAt: Date;
  groundStation: string;
  packetKind: string;
  sequenceNumber: number | null;
  rocketTimeMs: bigint | null;
  altitudeM: number | null;
  velocityMps: number | null;
  accelerationMps2: number | null;
  latitude: number | null;
  longitude: number | null;
  batteryV: number | null;
  temperatureC: number | null;
  pressurePa: number | null;
  rssiDbm: number | null;
  raw: unknown;
}) {
  return {
    id: frame.id.toString(),
    received_at: frame.receivedAt.toISOString(),
    ground_station: frame.groundStation,
    packet_kind: frame.packetKind,
    sequence_number: frame.sequenceNumber,
    rocket_time_ms: frame.rocketTimeMs?.toString() ?? null,
    altitude_m: frame.altitudeM,
    velocity_mps: frame.velocityMps,
    acceleration_mps2: frame.accelerationMps2,
    latitude: frame.latitude,
    longitude: frame.longitude,
    battery_v: frame.batteryV,
    temperature_c: frame.temperatureC,
    pressure_pa: frame.pressurePa,
    rssi_dbm: frame.rssiDbm,
    raw: frame.raw,
  };
}
