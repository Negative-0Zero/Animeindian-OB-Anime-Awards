import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  // If there's no code, show error
  if (!code) {
    return new NextResponse(
      `<html>
        <body style="background: #0a0a0a; color: white; font-family: monospace; padding: 20px;">
          <h1 style="color: #ff6b6b;">❌ Missing Code</h1>
          <p>No authorization code was received from Google.</p>
          <a href="/" style="color: #6bc9ff;">Go back home</a>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  // Check environment variables
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const missingEnv = []
  if (!clientId) missingEnv.push('NEXT_PUBLIC_GOOGLE_CLIENT_ID')
  if (!clientSecret) missingEnv.push('GOOGLE_CLIENT_SECRET')
  if (!supabaseUrl) missingEnv.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseKey) missingEnv.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  if (missingEnv.length > 0) {
    return new NextResponse(
      `<html>
        <body style="background: #0a0a0a; color: white; font-family: monospace; padding: 20px;">
          <h1 style="color: #ff6b6b;">❌ Missing Environment Variables</h1>
          <p>The following are not set in Vercel:</p>
          <ul style="color: #ff9999;">
            ${missingEnv.map(v => `<li>${v}</li>`).join('')}
          </ul>
          <a href="/" style="color: #6bc9ff;">Go back home</a>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  try {
    // 1. Exchange Google code for ID token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: 'https://animeindian-awards.vercel.app/auth/google/callback',
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()
    const idToken = tokenData.id_token
    const error = tokenData.error

    if (error || !idToken) {
      return new NextResponse(
        `<html>
          <body style="background: #0a0a0a; color: white; font-family: monospace; padding: 20px;">
            <h1 style="color: #ff6b6b;">❌ Google Token Exchange Failed</h1>
            <p style="color: #ff9999;">Error: ${error || 'No id_token'}</p>
            <pre style="background: #1a1a1a; padding: 10px; border-radius: 5px;">${JSON.stringify(tokenData, null, 2)}</pre>
            <a href="/" style="color: #6bc9ff;">Go back home</a>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    // 2. Create Supabase server client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (err) {}
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (err) {}
          },
        },
      }
    )

    // 3. Sign in with ID token
    const { data, error: supabaseError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    })

    if (supabaseError) {
      return new NextResponse(
        `<html>
          <body style="background: #0a0a0a; color: white; font-family: monospace; padding: 20px;">
            <h1 style="color: #ff6b6b;">❌ Supabase Sign In Failed</h1>
            <p style="color: #ff9999;">Error: ${supabaseError.message}</p>
            <p>This usually means the Google provider is not enabled in Supabase.</p>
            <p><strong>Go to Supabase Dashboard → Authentication → Providers → Google → toggle ON and enter your Client ID/Secret.</strong></p>
            <a href="/" style="color: #6bc9ff;">Go back home</a>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    // 4. Success! Show confirmation and redirect
    return new NextResponse(
      `<html>
        <body style="background: #0a0a0a; color: white; font-family: monospace; padding: 20px;">
          <h1 style="color: #6bc9ff;">✅ Login Successful!</h1>
          <p>User ID: ${data.user?.id}</p>
          <p>Email: ${data.user?.email || 'NULL'}</p>
          <p>Session created: ${!!data.session}</p>
          <p>You will be redirected in 3 seconds...</p>
          <script>
            setTimeout(() => window.location.href = 'https://animeindian-awards.vercel.app', 3000);
          </script>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  } catch (err: any) {
    return new NextResponse(
      `<html>
        <body style="background: #0a0a0a; color: white; font-family: monospace; padding: 20px;">
          <h1 style="color: #ff6b6b;">❌ Unexpected Error</h1>
          <p style="color: #ff9999;">${err?.message || 'Unknown error'}</p>
          <a href="/" style="color: #6bc9ff;">Go back home</a>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }
}
