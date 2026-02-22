'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import Login from '@/components/Login'
import * as Lucide from 'lucide-react'

// Map icon names to Lucide components
const iconMap: Record<string, React.ElementType> = {
  Trophy: Lucide.Trophy,
  Clapperboard: Lucide.Clapperboard,
  Mic: Lucide.Mic,
  Flame: Lucide.Flame,
  Zap: Lucide.Zap,
  Heart: Lucide.Heart,
  Tv: Lucide.Tv,
  Star: Lucide.Star,
  Sword: Lucide.Sword,
  Crown: Lucide.Crown,
  Award: Lucide.Award,
  Medal: Lucide.Medal,
  Sparkles: Lucide.Sparkles,
  Camera: Lucide.Camera,
  Film: Lucide.Film,
  Music: Lucide.Music,
  Radio: Lucide.Radio,
  Gamepad: Lucide.Gamepad,
  Brain: Lucide.Brain,
  Cloud: Lucide.Cloud,
  Sun: Lucide.Sun,
  Moon: Lucide.Moon,
  Smile: Lucide.Smile,
  ThumbsUp: Lucide.ThumbsUp,
  Flag: Lucide.Flag,
  Gift: Lucide.Gift,
  Globe: Lucide.Globe,
  Leaf: Lucide.Leaf,
  Diamond: Lucide.Diamond,
  // fallback
  default: Lucide.HelpCircle,
}

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchSettings()
  }, [])

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (err: any) {
      console.error('Error fetching categories:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchSettings() {
    const { data } = await supabase
      .from('site_content')
      .select('content')
      .eq('key', 'show_results')
      .single()
    if (data) setShowResults(data.content === 'true')
  }

  // Helper to render icon
  const renderIcon = (iconName: string, className = 'w-8 h-8') => {
    const Icon = iconMap[iconName] || iconMap.default
    return <Icon className={className} />
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-400 border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading categories...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full transition"
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 py-20 px-4">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            AnimeIndian Awards
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Celebrate the best of anime this season. Vote for your favorites across multiple categories.
          </p>
          {showResults && (
            <Link
              href="/results"
              className="inline-block mt-8 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-lg"
            >
              🏆 View Current Results
            </Link>
          )}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">
          <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
            Voting Categories
          </span>
        </h2>

        {categories.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No categories have been added yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const gradientFrom = category.gradient?.split(' ')[0]?.replace('from-', '') || 'from-yellow-600'
              const IconComponent = iconMap[category.icon_name] || iconMap.default

              return (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group relative overflow-hidden bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all duration-300"
                >
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient || 'from-yellow-600/20'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="relative z-10">
                    <div className={`inline-flex p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors ${category.color?.replace('group-hover:', '')}`}>
                      <IconComponent className="w-8 h-8" />
                    </div>

                    <h3 className="text-2xl font-bold mt-4 mb-2">{category.name}</h3>
                    {category.description && (
                      <p className="text-gray-400 text-sm">{category.description}</p>
                    )}
                    <div className="mt-4 text-sm text-orange-400 group-hover:translate-x-1 transition-transform">
                      View nominees →
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Login / CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-12 mt-12">
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-center md:text-left md:w-1/2">
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                🗳️ Ready to Vote?
              </h2>
              <p className="text-gray-300">
                <span className="font-semibold text-white">One person, one vote.</span> Sign in to cast your votes and make your favorites win!
              </p>
            </div>
            <div className="md:w-1/2 w-full">
              <Login compact={false} showReassurance={false} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} AnimeIndian Awards. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
          }
