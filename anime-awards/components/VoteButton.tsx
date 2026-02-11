'use client'

import { supabase } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'

interface VoteButtonProps {
  nomineeId: any
  category: string
  className?: string
  children?: React.ReactNode  // 👈 OPTIONAL – no error when not passed
  [key: string]: any          // allow any other props
}

export default function VoteButton({ 
  nomineeId, 
  category,
  className = "",
  children,
  ...props 
}: VoteButtonProps) {
  const [voted, setVoted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function checkVote() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('votes')
        .select('id')
        .eq('user_id', user.id)
        .eq('category', category)
        .maybeSingle()

      if (data) setVoted(true)
    }
    checkVote()
  }, [category])

  async function handleVote() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      const loginSection = document.getElementById('login-section')
      if (loginSection) {
        loginSection.scrollIntoView({ behavior: 'smooth' })
        loginSection.classList.add('ring-4', 'ring-yellow-400', 'rounded-lg')
        setTimeout(() => loginSection.classList.remove('ring-4', 'ring-yellow-400'), 2000)
      }
      alert('🔐 Please log in first! Your vote needs to be tied to your account to prevent duplicates.')
      return
    }

    if (voted) {
      alert('⚠️ You already voted in this category!')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('votes').insert([{
      user_id: user.id,
      category,
      nominee_id: nomineeId,
      is_jury: false
    }])

    setLoading(false)
    if (error?.code === '23505') {
      alert('⚠️ You already voted in this category!')
      setVoted(true)
    } else if (error) {
      alert('Error: ' + error.message)
    } else {
      setVoted(true)
      alert('✅ Vote counted! 🎉')
    }
  }

  return (
    <button
      onClick={handleVote}
      disabled={voted || loading}
      className={`bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold px-4 py-2 rounded-full text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {loading ? 'Submitting...' : voted ? '✓ Voted!' : (children || '🗳️ Vote')}
    </button>
  )
        }
