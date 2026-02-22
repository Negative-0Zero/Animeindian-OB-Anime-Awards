'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import Login from '@/components/Login'
import { Trophy } from 'lucide-react'

export default function JuryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isJury, setIsJury] = useState(false)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [nomineesByCategory, setNomineesByCategory] = useState<Record<string, any[]>>({})
  const [userVotes, setUserVotes] = useState<Record<string, string>>({})
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (!user) {
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_jury')
      .eq('id', user.id)
      .single()

    if (profile?.is_jury) {
      setIsJury(true)
      fetchData()
    } else {
      setIsJury(false)
      setLoading(false)
    }
  }

  async function fetchData() {
    setLoading(true)
    // Fetch categories sorted by display_order (for consistent order)
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
    setCategories(cats || [])

    // Initialize expanded categories (all expanded by default)
    if (cats) {
      setExpandedCategories(new Set(cats.map(c => c.id)))
    }

    // Fetch all nominees
    const { data: nominees } = await supabase
      .from('nominees')
      .select('*')
      .order('created_at')

    if (nominees) {
      const grouped = nominees.reduce((acc, n) => {
        if (!acc[n.category]) acc[n.category] = []
        acc[n.category].push(n)
        return acc
      }, {} as Record<string, any[]>)
      setNomineesByCategory(grouped)
    }

    // Fetch user's existing jury votes
    if (user) {
      const { data: votes } = await supabase
        .from('votes')
        .select('category, nominee_id')
        .eq('user_id', user.id)
        .eq('is_jury', true)

      if (votes) {
        const voteMap: Record<string, string> = {}
        votes.forEach(v => { voteMap[v.category] = v.nominee_id })
        setUserVotes(voteMap)
      }
    }

    setLoading(false)
  }

  async function handleVote(nomineeId: string, category: string) {
    if (userVotes[category]) {
      alert('You have already voted in this category.')
      return
    }

    const { error } = await supabase.from('votes').insert([{
      user_id: user.id,
      category,
      nominee_id: nomineeId,
      is_jury: true
    }])

    if (error) {
      if (error.code === '23505') {
        alert('You already voted in this category.')
      } else {
        alert('Error: ' + error.message)
      }
    } else {
      setUserVotes(prev => ({ ...prev, [category]: nomineeId }))
      alert('Jury vote recorded!')
    }
  }

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const expandAll = () => {
    setExpandedCategories(new Set(categories.map(c => c.id)))
  }

  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-4xl mx-auto">Loading jury panel...</div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-4">🔒 Jury Only</h1>
        <p className="text-gray-400 mb-6">Please log in to access the jury voting panel.</p>
        <Login compact={false} showReassurance={false} />
      </main>
    )
  }

  if (!isJury) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-4">⛔ Access Denied</h1>
        <p className="text-gray-400 mb-4">You do not have jury permissions.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-white text-slate-950 px-6 py-3 rounded-full font-bold"
        >
          Go Home
        </button>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Jury Voting Panel
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded border border-white/10"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded border border-white/10"
              >
                Collapse All
              </button>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-400 hover:text-white"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {categories.length === 0 ? (
          <p className="text-gray-400">No categories available.</p>
        ) : (
          <div className="space-y-4">
            {categories.map(cat => {
              const nominees = nomineesByCategory[cat.name] || []
              const alreadyVoted = !!userVotes[cat.name]
              const isExpanded = expandedCategories.has(cat.id)

              return (
                <div key={cat.id} className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
                  <div
                    className="bg-slate-800 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => toggleCategory(cat.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-lg">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                      <Trophy className="text-yellow-400" />
                      <h2 className="text-2xl font-bold">{cat.name}</h2>
                      {alreadyVoted && (
                        <span className="bg-green-500/20 text-green-400 text-sm px-3 py-1 rounded-full">
                          ✓ Voted
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {nominees.length} nominee{nominees.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="p-6">
                      {nominees.length === 0 ? (
                        <p className="text-gray-400">No nominees yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {nominees.map(nominee => {
                            const isVoted = userVotes[cat.name] === nominee.id
                            return (
                              <div
                                key={nominee.id}
                                className={`bg-slate-800/50 rounded-xl p-4 border ${
                                  isVoted ? 'border-green-500/50' : 'border-white/5'
                                } hover:border-white/20 transition-all`}
                              >
                                {nominee.image_url && (
                                  <img
                                    src={nominee.image_url}
                                    alt={nominee.title}
                                    className="w-full h-32 object-cover rounded-lg mb-3"
                                  />
                                )}
                                <h3 className="font-bold text-lg">{nominee.title}</h3>
                                {nominee.anime_name && (
                                  <p className="text-sm text-gray-400">{nominee.anime_name}</p>
                                )}
                                <button
                                  onClick={() => handleVote(nominee.id, cat.name)}
                                  disabled={alreadyVoted}
                                  className={`mt-4 w-full px-4 py-2 rounded-full font-bold transition ${
                                    alreadyVoted
                                      ? 'bg-gray-600 cursor-not-allowed'
                                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                                  }`}
                                >
                                  {alreadyVoted ? 'Vote Cast' : 'Vote as Jury'}
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
                                      }
