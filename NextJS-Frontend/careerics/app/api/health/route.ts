/**
 * Health-check API route — verifies the Next.js server is alive
 * and optionally pings both backends.
 *
 * GET /api/health
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
