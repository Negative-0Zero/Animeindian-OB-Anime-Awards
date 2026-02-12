'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function RulesPage() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRules()
  }, [])

  async function fetchRules() {
    const { data, error } = await supabase
      .from('site_content')
      .select('content')
      .eq('key', 'rules')
      .single()

    if (!error && data) {
      setContent(data.content)
    }
    setLoading(false)
  }

  // Simple markdown-like renderer
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) 
        return <h1 key={i} className="text-4xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">{line.slice(2)}</h1>
      if (line.startsWith('## ')) 
        return <h2 key={i} className="text-2xl font-bold mt-8 mb-3 text-white">{line.slice(3)}</h2>
      if (line.startsWith('- ')) 
        return <li key={i} className="ml-6 list-disc text-gray-300">{line.slice(2)}</li>
      if (line.trim() === '') 
        return <br key={i} />
      return <p key={i} className="mb-3 text-gray-300">{line}</p>
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-3xl mx-auto">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} />
          Back to Home
        </Link>
        <div className="prose prose-invert max-w-none">
          {renderMarkdown(content)}
        </div>
        <div className="mt-12 text-sm text-gray-500 border-t border-white/10 pt-6">
          <p>Last updated: Just now (content editable by admins)</p>
        </div>
      </div>
    </main>
  )
          }
