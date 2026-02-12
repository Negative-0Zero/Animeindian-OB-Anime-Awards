import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/client'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (!code) {
    return NextResponse.redirect(`${origin}?error=missing_code`)
  }

  try {
    // Exchange the authorization code for tokens with Google
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

    const { id_token, error } = await tokenResponse.json()

    if (error || !id_token) {
      console.error('Google token exchange error:', error)
      return NextResponse.redirect(`${origin}?error=auth_failed`)
    }

    // Sign in to Supabase using the ID token
    const { error: supabaseError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: id_token,
    })

    if (supabaseError) {
      console.error('Supabase sign in error:', supabaseError)
      return NextResponse.redirect(`${origin}?error=login_failed`)
    }

    return NextResponse.redirect(origin)
  } catch (err) {
    console.error('Callback error:', err)
    return NextResponse.redirect(`${origin}?error=unknown`)
  }
}
