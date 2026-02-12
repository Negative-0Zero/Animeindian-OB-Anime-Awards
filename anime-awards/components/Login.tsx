'use client'

import { supabase } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { FaDiscord, FaGoogle } from 'react-icons/fa'
import { HiOutlineShieldCheck } from 'react-icons/hi'
import { User } from '@supabase/supabase-js'

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  // ✅ SIMPLE DISCORD OAUTH – email unavoidable, but your trigger will delete it
  async function signInDiscord() {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: window.location.origin }
    })
  }

  // ✅ SIMPLE GOOGLE OAUTH – NO EMAIL (because you removed email scope from Google Cloud)
  async function signInGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        scopes: 'openid profile', // email scope is NOT requested
        queryParams: { prompt: 'consent' } // force new permissions
      }
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  if (hideWhenLoggedOut && !user) return null

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

  if (compact) {
    return (
      <div className="flex gap-1">
        <button onClick={signInDiscord} className="p-2 bg-[#5865F2]/10 hover:bg-[#5865F2] text-[#5865F2] hover:text-white rounded-lg transition-all" title="Discord">
          <FaDiscord size={20} />
        </button>
        <button onClick={signInGoogle} className="p-2 bg-white/10 hover:bg-white text-gray-400 hover:text-gray-900 rounded-lg transition-all border border-white/20" title="Google (No Email)">
          <FaGoogle size={20} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button onClick={signInDiscord} className="flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg w-full sm:w-auto">
          <FaDiscord className="text-xl" />
          <span>Continue with Discord</span>
        </button>
        <button onClick={signInGoogle} className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-medium px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg border border-gray-300 w-full sm:w-auto">
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
