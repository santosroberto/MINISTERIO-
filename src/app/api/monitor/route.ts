import { NextRequest, NextResponse } from "next/server"

interface MonitorPayload {
  level: string
  message: string
  context?: string
  data?: unknown
  url?: string
  userAgent?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload: MonitorPayload = await request.json()
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${payload.level.toUpperCase()}]`
    const ctx = payload.context ? ` [${payload.context}]` : ""
    const location = payload.url ? ` @ ${payload.url}` : ""
    const line = `${prefix}${ctx} ${payload.message}${location}`

    switch (payload.level) {
      case "error":
        console.error(line, payload.data || "")
        break
      case "warn":
        console.warn(line, payload.data || "")
        break
      default:
        console.log(line, payload.data || "")
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}

export const dynamic = "force-dynamic"
