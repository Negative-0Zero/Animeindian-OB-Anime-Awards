'use client'

import { supabase } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { FaDiscord, FaGoogle } from 'react-icons/fa'
import { HiOutlineShieldCheck } from 'react-icons/hi'
import { User } from '@supabase/supabase-js'

// ✅ Google Identity Services type declaration
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (config: {
            client_id: string
            scope: string
            ux_mode: string
            redirect_uri: string
            callback: (response: { code?: string; error?: string }) => void
          }) => {
            requestCode: () => void
          }
        }
      }
    }
  }
}

interface LoginProps {
  compact?: boolean
  showReassurance?: boolean
  hideWhenLoggedOut?: boolean
}

export default function Login({ 
  compact = false,
  showReassurance = true,
  hideWhenLoggedOut = false
}: LoginProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null)
    })

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    // Load Google Identity Services script
    if (!document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => setIsGoogleScriptLoaded(true)
      document.head.appendChild(script)
    } else {
      setIsGoogleScriptLoaded(true)
    }

    return () => listener?.subscription.unsubscribe()
  }, [])

  // ─── DISCORD LOGIN (email unavoidable, Supabase hardcodes it) ───
  async function signInDiscord() {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: window.location.origin }
    })
  }

  // ─── GOOGLE LOGIN – AUTHORIZATION CODE FLOW, NO EMAIL ──────────
  async function signInGoogle() {
    if (!isGoogleScriptLoaded) {
      alert('Google Sign-In is still loading. Please try again.')
      return
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      alert('Google Client ID is not configured.')
      return
    }

    try {
      const client = window.google?.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: 'openid profile', // ✅ NO EMAIL SCOPE – MAXIMUM PRIVACY
        ux_mode: 'popup',
        redirect_uri: `${window.location.origin}/auth/google/callback`,
        callback: (response) => {
          if (response.error) {
            console.error('Google OAuth error:', response.error)
            alert('Google login was cancelled or failed.')
          }
          // The code will be sent to the redirect URI – no need to handle here
        },
      })

      // ✅ CRITICAL GUARD – prevents TypeScript error and runtime crash
      if (client) {
        client.requestCode()
      } else {
        console.error('Google client initialization failed')
        alert('Google Sign-In failed to initialize. Please try again.')
      }
    } catch (error) {
      console.error('Failed to initialize Google Sign-In:', error)
      alert('Google Sign-In failed to initialize. Check your Client ID.')
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  // ─── HEADER: HIDE WHEN LOGGED OUT ─────────────────────────
  if (hideWhenLoggedOut && !user) {
    return null
  }

  // ─── LOGGED IN – PROFILE + EXIT BUTTON ────────────────────
  if (user) {
    return (
      <div className="flex items-center justify-between w-full bg-black/20 backdrop-blur-sm px-3 py-2 rounded-full">
        <div className="flex items-center gap-2">
          <img 
            src={user.user_metadata.avatar_url} 
            className="w-8 h-8 rounded-full border-2 border-purple-400" 
            alt="avatar"
          />
          <span className="text-sm text-white hidden sm:inline">
            {user.user_metadata.full_name || user.user_metadata.name}
          </span>
        </div>
        <button 
          onClick={signOut} 
          className="text-xs text-gray-300 hover:text-white px-2 py-1 rounded-full bg-black/30 ml-2"
        >
          Exit
        </button>
      </div>
    )
  }

  // ─── COMPACT MODE (ICONS ONLY) – FOR HEADER ───────────────
  if (compact) {
    return (
      <div className="flex gap-1">
        <button 
          onClick={signInDiscord}
          className="p-2 bg-[#5865F2]/10 hover:bg-[#5865F2] text-[#5865F2] hover:text-white rounded-lg transition-all"
          title="Login with Discord"
        >
          <FaDiscord size={20} />
        </button>
        <button 
          onClick={signInGoogle}
          className="p-2 bg-white/10 hover:bg-white text-gray-400 hover:text-gray-900 rounded-lg transition-all border border-white/20"
          title="Login with Google (No Email)"
        >
          <FaGoogle size={20} />
        </button>
      </div>
    )
  }

  // ─── FULL MODE – BUTTONS WITH TEXT + REASSURANCE ──────────
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button 
          onClick={signInDiscord}
          className="flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
        >
          <FaDiscord className="text-xl" />
          <span>Continue with Discord</span>
        </button>
        <button 
          onClick={signInGoogle}
          className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-medium px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg border border-gray-300 w-full sm:w-auto"
        >
          <FaGoogle className="text-xl text-[#4285F4]" />
          <span>Continue with Google</span>
        </button>
      </div>
      
      {showReassurance && (
        <div className="flex items-center gap-2 text-xs text-gray-300 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
          <HiOutlineShieldCheck className="text-green-400 text-base" />
          <span>🔐 Your email is only used for authentication and to prevent duplicate votes.</span>
        </div>
      )}
    </div>
  )
        }
