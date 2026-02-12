import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('🔵 Callback route hit')
  console.log('🔵 Origin:', origin)
  console.log('🔵 Code present:', !!code)

  if (!code) {
    console.error('❌ No code provided')
    return NextResponse.redirect(`${origin}?error=missing_code`)
  }

  // Check environment variables (don't log full secrets, just existence)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔵 GOOGLE_CLIENT_ID exists:', !!clientId)
  console.log('🔵 GOOGLE_CLIENT_SECRET exists:', !!clientSecret)
  console.log('🔵 SUPABASE_URL exists:', !!supabaseUrl)
  console.log('🔵 SUPABASE_ANON_KEY exists:', !!supabaseAnonKey)

  if (!clientId || !clientSecret || !supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables')
    return NextResponse.redirect(`${origin}?error=missing_env`)
  }

  try {
    // 1. Exchange Google code for ID token
    console.log('🔵 Exchanging code for Google token...')
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
      console.error('❌ Google token exchange error:', error || 'No id_token')
      console.error('Token response:', JSON.stringify(tokenData, null, 2))
      return NextResponse.redirect(`${origin}?error=auth_failed`)
    }
    console.log('✅ Google ID token received')

    // 2. Create Supabase server client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (err) {
              console.error('❌ Error setting cookie:', err)
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (err) {
              console.error('❌ Error removing cookie:', err)
            }
          },
        },
      }
    )

    // 3. Sign in with ID token
    console.log('🔵 Signing in to Supabase with ID token...')
    const { data, error: supabaseError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    })

    if (supabaseError) {
      console.error('❌ Supabase sign in error:', supabaseError)
      return NextResponse.redirect(`${origin}?error=login_failed`)
    }

    console.log('✅ Supabase sign in successful. User ID:', data?.user?.id)
    console.log('✅ Session created:', !!data?.session)

    // 4. Success! Redirect to home
    return NextResponse.redirect('https://animeindian-awards.vercel.app')
  } catch (err) {
    console.error('❌ Callback unexpected error:', err)
    return NextResponse.redirect(`${origin}?error=unknown`)
  }
      }
