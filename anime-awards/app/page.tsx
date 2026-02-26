'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import Login from '@/components/Login'
import Footer from '@/components/Footer'
import Category3DCarousel from '@/components/Category3DCarousel'
import {
  Trophy, Calendar, Star, Flame, Heart, Zap,
  Clapperboard, Mic, Tv, ArrowRight,
  Sword, Crown, Award, Medal, Sparkles, Camera, Film,
  Music, Radio, Gamepad, Brain, Cloud, Sun, Moon,
  Smile, ThumbsUp, Flag, Gift, Globe, Leaf, Diamond,
  FileText, Tag, ThumbsUp as ThumbsUpIcon,
} from "lucide-react"
import { fetchFromAPI } from '@/utils/api'

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

export default function Home() {
  const [categories, setCategories] = useState<any[]>([])
  const [nomineesByCategory, setNomineesByCategory] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeData = async () => {
      await supabase.auth.getSession()
      await fetchData()
    }
    initializeData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError(null)
    
    try {
      const categoriesData = await fetchFromAPI('/categories?select=*&order=display_order.asc')
      setCategories(categoriesData || [])

      const nomineesData = await fetchFromAPI('/nominees?select=*&order=created_at.asc')

      if (nomineesData) {
        const grouped = nomineesData.reduce((acc: any, nominee: any) => {
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
            <Link
              href="/rules"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-md text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <FileText size={20} />
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
              <h2 className="text-3xl font-bold mb-3 flex items-center gap-2 justify-center md:justify-start">
                <ThumbsUpIcon className="text-yellow-400" /> Ready to Vote?
              </h2>
              <p className="text-gray-300">
                <span className="font-semibold text-white">One person, one vote.</span> We use secure login to ensure fairness – no duplicate votes.
              </p>
            </div>
            <div className="md:w-1/2 w-full">
              <Login compact={false} showReassurance={true} />
            </div>
          </div>
        </div>
      </section>

      {/* 3D Category Carousel */}
      <section className="py-12">
        <Category3DCarousel />
      </section>

      <Footer />
    </main>
  )
          }
