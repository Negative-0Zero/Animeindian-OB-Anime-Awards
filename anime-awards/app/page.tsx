'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import Login from '@/components/Login'
import Footer from '@/components/Footer'
import { 
  Trophy, Calendar, Star, Flame, Heart, Zap, 
  Clapperboard, Mic, Tv, ArrowRight,
  Sword, Crown, Award, Medal, Sparkles, Camera, Film,
  Music, Radio, Gamepad, Brain, Cloud, Sun, Moon,
  Smile, ThumbsUp, Flag, Gift, Globe, Leaf, Diamond
} from "lucide-react"

const SEASON = {
  name: "Winter 2026",
  liveBadge: "Winter 2026",
  titleLine2: "WINTER 2026 AWARDS",
  animeOf: "Anime of the Season",
  movieOf: "Movie of the Season",
  timelineNominations: "Jan 15 – Feb 10",
  timelineVoting: "Feb 11 – Feb 28",
  timelineWinners: "With Otaku Bhaskar"
}

const iconMap: Record<string, React.ElementType> = {
  Trophy, Clapperboard, Mic, Flame, Zap, Heart, Tv, Star,
  Sword, Crown, Award, Medal, Sparkles, Camera, Film,
  Music, Radio, Gamepad, Brain, Cloud, Sun, Moon,
  Smile, ThumbsUp, Flag, Gift, Globe, Leaf, Diamond
}

export default function Home() {
  const [categories, setCategories] = useState<any[]>([])
  const [nomineesByCategory, setNomineesByCategory] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Wait for Supabase to restore session before fetching data
    const initializeData = async () => {
      await supabase.auth.getSession() // ensures client is ready
      await fetchData()
    }
    initializeData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError(null)
    
    try {
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })
      
      if (catError) throw catError
      setCategories(categoriesData || [])
      
      const { data: nomineesData, error: nomError } = await supabase
        .from('nominees')
        .select('*')
        .order('created_at', { ascending: true })

      if (nomError) throw nomError

      if (nomineesData) {
        const grouped = nomineesData.reduce((acc, nominee) => {
          if (!acc[nominee.category]) acc[nominee.category] = []
          acc[nominee.category].push(nominee)
          return acc
        }, {} as Record<string, any[]>)
        setNomineesByCategory(grouped)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load categories. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const TicketIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
    </svg>
  )

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white">
      <header className="absolute top-4 right-4 z-50">
        <Login compact={false} hideWhenLoggedOut={true} />
      </header>

      {/* Hero Section */}
      <div className="relative flex flex-col items-center justify-center h-[70vh] text-center px-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[20%] w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse"></div>
        </div>

        <div className="z-10 relative mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6 hover:bg-white/10 transition-colors cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-sm font-bold text-gray-200 tracking-wide uppercase">Live • {SEASON.liveBadge}</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 drop-shadow-2xl">
              r/AnimeIndian
            </span>
            <br />
            <span className="text-white drop-shadow-lg">{SEASON.titleLine2}</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The biggest community event is back. Celebrating the best
            <span className="text-white font-bold"> Hindi Dubs</span>,
            <span className="text-white font-bold"> Theatrical Releases</span>, and
            <span className="text-white font-bold"> {SEASON.animeOf}</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={`/category/anime-of-the-season`}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 font-black text-lg rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <Trophy size={20} className="text-yellow-600" />
              VOTE NOW
            </Link>
            {/* ✅ FIXED: Timeline button now links to Rules page */}
            <Link
              href="/rules"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-md text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Calendar size={20} />
              Rules & Info
            </Link>
          </div>
        </div>
      </div>

      {/* Login Section */}
      <section id="login-section" className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-center md:text-left md:w-1/2">
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                🗳️ Ready to Vote?
              </h2>
              <p className="text-gray-300 mb-2">
                <span className="font-semibold text-white">One person, one vote.</span> We use secure login to ensure fairness – no duplicate votes.
              </p>
              <p className="text-gray-400 text-sm">
                🔐 Your email is only used for authentication and to prevent duplicate votes.
              </p>
            </div>
            <div className="md:w-1/2 w-full">
              <Login compact={false} showReassurance={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories-section" className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 flex items-center justify-center gap-3 text-center">
            <Star className="text-yellow-400 fill-yellow-400" />
            <span>The Categories – {SEASON.name}</span>
          </h2>

          {loading && <p className="text-center text-gray-400">Loading categories...</p>}
          {error && <p className="text-center text-red-400">{error}</p>}
          {!loading && !error && categories.length === 0 && (
            <p className="text-center text-gray-400">No categories found. Please add some in the admin panel.</p>
          )}
          {!loading && !error && categories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const nomineeCount = nomineesByCategory[cat.name]?.length || 0
                const IconComponent = iconMap[cat.icon_name] || Trophy
                
                return (
                  <div
                    key={cat.id}
                    className={`group relative bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 ${cat.color || 'group-hover:border-white/30'} transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient || 'from-gray-600/20'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl`}></div>
                    <div className="relative z-10">
                      <div className="mb-4 p-3 bg-white/5 w-fit rounded-lg border border-white/5">
                        <IconComponent className="text-4xl" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">{cat.name}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-4">
                        {cat.description || 'Vote for your favourite!'}
                      </p>
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/category/${cat.slug}`}
                          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold px-6 py-3 rounded-full text-sm transition-all shadow-lg inline-flex items-center justify-center"
                        >
                          🗳️ Vote in this category
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
        }
