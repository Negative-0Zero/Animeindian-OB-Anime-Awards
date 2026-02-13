'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import Login from '@/components/Login'
import VoteButton from '@/components/VoteButton'
import { ArrowLeft } from 'lucide-react'

export default function CategoryClient({ slug: propSlug }: { slug?: string }) {
  const router = useRouter()
  const [slug, setSlug] = useState<string | null>(null)
  const [category, setCategory] = useState<string>('')
  const [nominees, setNominees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // On mount, if slug prop is missing, extract from URL
  useEffect(() => {
    if (propSlug) {
      setSlug(propSlug)
    } else {
      // Extract slug from pathname, e.g., "/category/anime-of-the-season" -> "anime-of-the-season"
      const pathParts = window.location.pathname.split('/')
      const lastPart = pathParts[pathParts.length - 1]
      if (lastPart && lastPart !== 'category') {
        setSlug(lastPart)
      } else {
        setError('No category specified in URL.')
        setLoading(false)
      }
    }
  }, [propSlug])

  useEffect(() => {
    if (!slug) return
    fetchCategoryAndNominees()
  }, [slug])

  async function fetchCategoryAndNominees() {
    if (!slug) return
    setLoading(true)
    setError(null)

    try {
      let categoryName = ''
      const { data: categoryData, error: catError } = await supabase
        .from('categories')
        .select('name')
        .eq('slug', slug)
        .maybeSingle()

      if (catError) throw new Error(`Category error: ${catError.message}`)

      if (categoryData) {
        categoryName = categoryData.name
      } else {
        // Fallback: convert slug to readable name
        categoryName = slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }
      setCategory(categoryName)

      const { data: nomineesData, error: nomError } = await supabase
        .from('nominees')
        .select('*')
        .eq('category', categoryName)
        .order('created_at', { ascending: true })

      if (nomError) throw new Error(`Nominees error: ${nomError.message}`)

      setNominees(nomineesData || [])
    } catch (err: any) {
      console.error('Error in CategoryClient:', err)
      setError(err.message || 'Failed to load nominees.')
    } finally {
      setLoading(false)
    }
  }

  if (!slug && !error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-3xl mx-auto text-center">Initializing...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={() => router.back()}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full transition"
          >
            ← Go Back
          </button>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-400">Loading nominees...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
          {category}
        </h1>
        <p className="text-gray-400 mb-8">
          {nominees.length} nominee{nominees.length !== 1 ? 's' : ''}
        </p>

        {nominees.length === 0 ? (
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-gray-400 mb-4">No nominees in this category yet.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full transition"
            >
              Go to Homepage
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nominees.map((nominee) => (
              <div
                key={nominee.id}
                className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all"
              >
                {nominee.image_url && (
                  <img
                    src={nominee.image_url}
                    alt={nominee.title}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                )}
                <h2 className="text-2xl font-bold mb-2">{nominee.title}</h2>
                {nominee.anime_name && (
                  <p className="text-gray-400 text-sm mb-4">{nominee.anime_name}</p>
                )}
                <div className="mt-4">
                  <VoteButton
                    nomineeId={nominee.id}
                    category={category}
                    onVoteSuccess={fetchCategoryAndNominees}
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <section className="max-w-4xl mx-auto px-4 py-12 mt-12">
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-center md:text-left md:w-1/2">
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                🗳️ Ready to Vote?
              </h2>
              <p className="text-gray-300">
                <span className="font-semibold text-white">One person, one vote.</span> Your vote counts!
              </p>
            </div>
            <div className="md:w-1/2 w-full">
              <Login compact={false} showReassurance={false} />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
             }
