'use client'

import { supabase } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'

interface VoteButtonProps {
    nomineeId: string
    category: string
    className?: string
    children?: React.ReactNode
    onVoteSuccess?: () => void
    isHero?: boolean
}

export default function VoteButton({
    nomineeId,
    category,
    className = "",
    children,
    onVoteSuccess,
    isHero = false
}: VoteButtonProps) {
    const [user, setUser] = useState<User | null>(null)
    const [voted, setVoted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [pendingVote, setPendingVote] = useState(false)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
    }, [])

    // After login, if pendingVote is true, scroll to categories
    useEffect(() => {
        if (pendingVote && user) {
            setPendingVote(false)
            const categoriesSection = document.getElementById('categories-section')
            if (categoriesSection) {
                categoriesSection.scrollIntoView({ behavior: 'smooth' })
                categoriesSection.classList.add('ring-4', 'ring-yellow-400', 'rounded-lg')
                setTimeout(() => categoriesSection.classList.remove('ring-4', 'ring-yellow-400'), 2000)
            }
        }
    }, [user, pendingVote])

    // Check if already voted (skip for hero button)
    useEffect(() => {
        if (!user || isHero) return
        async function checkVote() {
            const { data } = await supabase
                .from('votes')
                .select('id')
                .eq('user_id', user.id)
                .eq('category', category)
                .maybeSingle()
            setVoted(!!data)
        }
        checkVote()
    }, [user, category, isHero])

    async function handleVote() {
        // 🎯 HERO BUTTON MODE – no voting, just scroll or login
        if (isHero) {
            if (!user) {
                setPendingVote(true)
                const loginSection = document.getElementById('login-section')
                if (loginSection) {
                    loginSection.scrollIntoView({ behavior: 'smooth' })
                    loginSection.classList.add('ring-4', 'ring-yellow-400', 'rounded-lg')
                    setTimeout(() => loginSection.classList.remove('ring-4', 'ring-yellow-400'), 2000)
                }
                alert('🔐 Please log in first – you\'ll be taken to the categories after login.')
                return
            } else {
                const categoriesSection = document.getElementById('categories-section')
                if (categoriesSection) {
                    categoriesSection.scrollIntoView({ behavior: 'smooth' })
                    categoriesSection.classList.add('ring-4', 'ring-yellow-400', 'rounded-lg')
                    setTimeout(() => categoriesSection.classList.remove('ring-4', 'ring-yellow-400'), 2000)
                }
                return
            }
        }

        // 🗳️ NORMAL VOTE BUTTON
        if (!user) {
            setPendingVote(true)
            const loginSection = document.getElementById('login-section')
            if (loginSection) {
                loginSection.scrollIntoView({ behavior: 'smooth' })
                loginSection.classList.add('ring-4', 'ring-yellow-400', 'rounded-lg')
                setTimeout(() => loginSection.classList.remove('ring-4', 'ring-yellow-400'), 2000)
            }
            alert('🔐 Please log in first – you\'ll be taken back to vote after login.')
            return
        }

        if (voted) {
            alert('⚠️ You already voted in this category!')
            return
        }

        setLoading(true)

        const { error: voteError } = await supabase
            .from('votes')
            .insert([{
                user_id: user.id,
                category,
                nominee_id: nomineeId,
                is_jury: false
            }])

        if (voteError) {
            if (voteError.code === '23505') {
                alert('⚠️ You already voted in this category!')
                setVoted(true)
            } else {
                alert('Error: ' + voteError.message)
            }
            setLoading(false)
            return
        }

        const { error: rpcError } = await supabase
            .rpc('increment_votes', { nominee_id: nomineeId, is_jury: false })

        setLoading(false)
        if (rpcError) console.error('Vote count increment failed:', rpcError)

        setVoted(true)
        onVoteSuccess?.()
        alert('✅ Vote counted! 🎉')
    }

    return (
        <button
            onClick={handleVote}
            disabled={voted || loading}
            className={`bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold px-4 py-2 rounded-full text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {loading ? 'Submitting...' : voted ? '✓ Voted!' : (children || '🗳️ Vote')}
        </button>
    )
}