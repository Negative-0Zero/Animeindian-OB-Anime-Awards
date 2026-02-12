import { NextResponse } from 'next/server'

export async function GET() {
  const origin = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000'
  
  const redirectUri = `${origin}/auth/google/callback`
  
  return new NextResponse(`
    <html>
      <body style="background: #0a0a0a; color: white; font-family: monospace; padding: 20px;">
        <h1>🔍 Redirect URI Debug</h1>
        <p style="font-size: 1.5rem; word-break: break-all;">
          <strong>Your exact redirect_uri is:</strong><br>
          <code style="background: #1a1a1a; padding: 10px; display: block; margin-top: 10px;">
            ${redirectUri}
          </code>
        </p>
        <p style="color: #aaa; margin-top: 20px;">
          Copy this URI exactly and paste it into Google Cloud Console → Credentials → Authorized redirect URIs.
        </p>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  })
}
