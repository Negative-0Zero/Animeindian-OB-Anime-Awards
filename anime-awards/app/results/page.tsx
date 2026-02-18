'use client'

import { useEffect, useState, useRef } from 'react'
import confetti from 'canvas-confetti'
import { supabase } from '@/utils/supabase/client'
import { Trophy, X } from 'lucide-react'

export default function ResultsPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [nomineesByCategory, setNomineesByCategory] = useState<Record<string, any[]>>({})
  const [resultsByCategory, setResultsByCategory] = useState<Record<string, any[]>>({})
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [selectedNominee, setSelectedNominee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const categoryRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError(null)

    try {
      const { data: nomineesData, error: nomError } = await supabase
        .from('nominees')
        .select('*')
        .order('created_at')

      if (nomError) throw new Error(nomError.message)

      const { data: resultsData, error: resError } = await supabase
        .from('results')
        .select('*, nominees(title, anime_name, image_url)')
        .order('category')
        .order('rank')

      if (resError) throw new Error(resError.message)

      const nomineesMap: Record<string, any[]> = {}
      const catSet = new Set<string>()
      nomineesData?.forEach(n => {
        if (!nomineesMap[n.category]) nomineesMap[n.category] = []
        nomineesMap[n.category].push(n)
        catSet.add(n.category)
      })

      const resultsMap: Record<string, any[]> = {}
      resultsData?.forEach(r => {
        if (!resultsMap[r.category]) resultsMap[r.category] = []
        resultsMap[r.category].push(r)
        catSet.add(r.category)
      })

      setCategories(Array.from(catSet).sort())
      setNomineesByCategory(nomineesMap)
      setResultsByCategory(resultsMap)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const scrollToCategory = (category: string) => {
    categoryRefs.current[category]?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleReveal = (category: string) => {
    setRevealed(prev => ({ ...prev, [category]: true }))
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
  }

  const toggleExpand = (category: string) => {
    setExpanded(prev => ({ ...prev, [category]: !prev[category] }))
  }

  const handleNomineeClick = (nominee: any, category: string) => {
    if (!revealed[category]) {
      alert('Results not revealed yet! Click "REVEAL WINNER" first.')
      return
    }
    const result = resultsByCategory[category]?.find(r => r.nominee_id === nominee.id)
    setSelectedNominee({ ...nominee, result })
  }

  const closeModal = () => setSelectedNominee(null)

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-6xl mx-auto text-center">Loading results...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error loading results</h1>
          <p className="text-gray-400">{error}</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-white/10 rounded-lg">
            Retry
          </button>
        </div>
      </main>
    )
  }

  if (categories.length === 0) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
            Results Not Ready
          </h1>
          <p className="text-gray-400">Winners will be announced after the voting deadline.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Sticky header with category navigation */}
      <div className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
            🏆 Winners
          </h1>
          <div className="flex overflow-x-auto gap-2 pb-2 max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => scrollToCategory(cat)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm whitespace-nowrap transition"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-16">
        {categories.map(category => {
          const nominees = nomineesByCategory[category] || []
          const results = resultsByCategory[category] || []
          const winner = results[0]
          const isRevealed = revealed[category]
          const isExpanded = expanded[category] || false

          return (
            <section
              key={category}
              ref={el => { categoryRefs.current[category] = el }}
              className="scroll-mt-24"
            >
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                <Trophy className="text-yellow-400" />
                {category}
              </h2>

              {!isRevealed ? (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {nominees.map(nominee => (
                      <div
                        key={nominee.id}
                        onClick={() => handleNomineeClick(nominee, category)}
                        className="bg-slate-800/50 rounded-xl p-4 text-center border border-white/10 hover:border-yellow-500/30 transition cursor-pointer"
                      >
                        {nominee.image_url && (
                          <img
                            src={nominee.image_url}
                            alt={nominee.title}
                            className="w-20 h-20 object-cover rounded-full mx-auto mb-3 border-2 border-white/20"
                          />
                        )}
                        <h3 className="font-bold text-sm md:text-base">{nominee.title}</h3>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <button
                      onClick={() => handleReveal(category)}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black text-lg rounded-full hover:scale-105 transition-all shadow-2xl"
                    >
                      ✨ REVEAL WINNER ✨
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {winner ? (
                    <>
                      <div className="bg-gradient-to-br from-yellow-900 via-purple-900 to-pink-900 rounded-3xl p-8 md:p-12 text-center border-4 border-yellow-400 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-300/20 via-transparent to-transparent" />
                        <p className="text-sm uppercase tracking-widest text-yellow-300 mb-2">
                          GRAND WINNER
                        </p>
                        <h2 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                          {winner.nominees?.title}
                        </h2>
                        {winner.nominees?.anime_name && (
                          <p className="text-xl text-white/80 mb-6">{winner.nominees.anime_name}</p>
                        )}
                        {winner.nominees?.image_url && (
                          <img
                            src={winner.nominees.image_url}
                            alt={winner.nominees.title}
                            className="w-40 h-40 object-cover rounded-full mx-auto mb-6 border-4 border-yellow-400 shadow-xl"
                          />
                        )}
                        <div className="flex justify-center gap-8 text-white/90 text-sm mb-8">
                          <div>
                            <span className="block text-2xl font-bold">{winner.public_votes}</span>
                            <span>Public Votes</span>
                          </div>
                          <div>
                            <span className="block text-2xl font-bold">{winner.jury_votes}</span>
                            <span>Jury Votes</span>
                          </div>
                          <div>
                            <span className="block text-2xl font-bold">{winner.final_score?.toFixed(1)}</span>
                            <span>Final Score</span>
                          </div>
                        </div>
                      </div>

                      {/* Toggle button outside the card */}
                      <div className="text-center mt-4">
                        <button
                          onClick={() => toggleExpand(category)}
                          className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition"
                        >
                          {isExpanded ? 'Hide Nominees' : 'Show All Nominees'}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-6">
                          <h3 className="text-xl font-semibold mb-4 text-gray-300">All Nominees</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {nominees.map(nominee => {
                              const result = results.find(r => r.nominee_id === nominee.id)
                              return (
                                <div
                                  key={nominee.id}
                                  onClick={() => handleNomineeClick(nominee, category)}
                                  className={`bg-slate-800/50 rounded-xl p-4 text-center border ${
                                    result ? 'border-yellow-500/50' : 'border-white/10'
                                  } hover:border-yellow-400 transition cursor-pointer`}
                                >
                                  {nominee.image_url && (
                                    <img
                                      src={nominee.image_url}
                                      alt={nominee.title}
                                      className="w-20 h-20 object-cover rounded-full mx-auto mb-3 border-2 border-white/20"
                                    />
                                  )}
                                  <h4 className="font-bold text-sm md:text-base">{nominee.title}</h4>
                                  {result && (
                                    <span className="inline-block mt-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                                      Rank #{result.rank}
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400 text-center">No winner data for this category.</p>
                  )}
                </div>
              )}
            </section>
          )
        })}
      </div>

      {/* Modal for nominee details */}
      {selectedNominee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={closeModal}>
          <div
            className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 max-w-md w-full border-2 border-yellow-400 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="text-center">
              {selectedNominee.image_url && (
                <img
                  src={selectedNominee.image_url}
                  alt={selectedNominee.title}
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-yellow-400"
                />
              )}
              <h2 className="text-3xl font-bold mb-2">{selectedNominee.title}</h2>
              {selectedNominee.anime_name && (
                <p className="text-gray-400 mb-4">{selectedNominee.anime_name}</p>
              )}
              {selectedNominee.result ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">Rank #{selectedNominee.result.rank}</p>
                  <div className="flex justify-center gap-4 text-sm">
                    <div>
                      <span className="block text-xl font-bold">{selectedNominee.result.public_votes}</span>
                      <span>Public</span>
                    </div>
                    <div>
                      <span className="block text-xl font-bold">{selectedNominee.result.jury_votes}</span>
                      <span>Jury</span>
                    </div>
                    <div>
                      <span className="block text-xl font-bold">{selectedNominee.result.final_score?.toFixed(1)}</span>
                      <span>Score</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No vote data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
