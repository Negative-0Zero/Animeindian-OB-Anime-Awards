import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (!code) {
    return NextResponse.redirect(`${origin}?error=missing_code`)
  }

  try {
    // 1. Exchange Google code for ID token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${origin}/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })

    const { id_token, error: googleError } = await tokenResponse.json()

    if (googleError || !id_token) {
      console.error('Google token exchange error:', googleError)
      return NextResponse.redirect(`${origin}?error=auth_failed`)
    }

    // 2. Create Supabase server client (can set cookies)
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (err) {
              // Ignore – called from Server Component
            }
          },
        },
      }
    )

    // 3. Sign in with ID token
    const { error: supabaseError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: id_token,
    })

    if (supabaseError) {
      console.error('Supabase sign in error:', supabaseError)
      return NextResponse.redirect(`${origin}?error=login_failed`)
    }

    // 4. Success – redirect to home
    return NextResponse.redirect(origin)
  } catch (err) {
    console.error('Callback error:', err)
    return NextResponse.redirect(`${origin}?error=unknown`)
  }
}
