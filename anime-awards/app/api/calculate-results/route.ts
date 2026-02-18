import { NextResponse } from 'next/server'

// GET handler – just to test the route exists
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'API route is working' })
}

export async function POST(request: Request) {
  // ... your existing POST code ...
}
