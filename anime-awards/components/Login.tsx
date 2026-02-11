'use client'

import { supabase } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { FaDiscord, FaGoogle } from 'react-icons/fa'
import { HiOutlineShieldCheck } from 'react-icons/hi'

export default function Login({
    compact = false,        // If true, shows only icons + tooltip (for mobile header)
    showReassurance = true  // Show the security message
}) {
    const [user, setUser] = useState(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user || null)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null)
        })

        return () => listener?.subscription.unsubscribe()
    }, [])

    async function signInDiscord() {
        await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: { redirectTo: window.location.origin }
        })
    }

    async function signInGoogle() {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        })
    }

    async function signOut() {
        await supabase.auth.signOut()
    }

    // ✅ Already logged in – show profile
    if (user) {
        return (
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-full">
                <img
                    src={user.user_metadata.avatar_url}
                    className="w-8 h-8 rounded-full border-2 border-purple-400"
                    alt="avatar"
                />
                <span className="text-sm text-white hidden sm:inline">
                    {user.user_metadata.full_name || user.user_metadata.name}
                </span>
                <button
                    onClick={signOut}
                    className="text-xs text-gray-300 hover:text-white px-2 py-1 rounded-full bg-black/30"
                >
                    Exit
                </button>
            </div>
        )
    }

    // ❌ Not logged in – show login options
    // COMPACT MODE: Just icons (for header on mobile)
    if (compact) {
        return (
            <div className="flex gap-1">
                <button
                    onClick={signInDiscord}
                    className="p-2 bg-[#5865F2] hover:bg-[#4752C4] rounded-full text-white transition-all"
                    title="Login with Discord"
                >
                    <FaDiscord className="text-xl" />
                </button>
                <button
                    onClick={signInGoogle}
                    className="p-2 bg-white hover:bg-gray-100 rounded-full text-gray-800 transition-all border border-gray-300"
                    title="Login with Google"
                >
                    <FaGoogle className="text-xl text-[#4285F4]" />
                </button>
            </div>
        )
    }

    // FULL MODE: Buttons with text + reassurance
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
                    <span>🔒 One vote per person – we only use your email to prevent duplicates. Your data is never shared.</span>
                </div>
            )}
        </div>
    )
}