'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Login from '@/components/Login'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'nominees' | 'categories' | 'content' | 'dashboard'>('nominees')
  const router = useRouter()

  // ----- Nominees State -----
  const [nominees, setNominees] = useState<any[]>([])
  const [nomineeForm, setNomineeForm] = useState({
    category: '',
    title: '',
    anime_name: '',
    image_url: ''
  })
  const [categories, setCategories] = useState<any[]>([])
  const [editingNomineeId, setEditingNomineeId] = useState<string | null>(null)

  // ----- Bulk Actions State -----
  const [selectedNominees, setSelectedNominees] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<'delete' | 'move' | ''>('')
  const [targetCategory, setTargetCategory] = useState('')
  const [bulkProcessing, setBulkProcessing] = useState(false)

  // ----- Categories State -----
  const [categoryList, setCategoryList] = useState<any[]>([])
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    icon_name: 'Trophy',
    color: 'group-hover:border-yellow-500/50',
    gradient: 'from-yellow-600/20',
    description: ''
  })
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [reordering, setReordering] = useState(false)

  // ----- Dashboard State -----
  const [dashboardData, setDashboardData] = useState<{
    totalVotes: number
    totalNominees: number
    totalCategories: number
    categoryStats: { category: string; totalVotes: number; nominees: any[] }[]
  } | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)

  // ----- Collapsible Categories State (for Nominees tab) -----
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  // ----- Site Content State -----
  const [rulesContent, setRulesContent] = useState('')
  const [savingContent, setSavingContent] = useState(false)
  const [contentMessage, setContentMessage] = useState('')
  const [showResults, setShowResults] = useState('false')

  // ----- Rebuild Debounce -----
  let rebuildTimeout: NodeJS.Timeout;

  // Available icons
  const iconOptions = [
    'Trophy', 'Clapperboard', 'Mic', 'Flame', 'Zap', 'Heart', 'Tv', 'Star',
    'Sword', 'Crown', 'Award', 'Medal', 'Sparkles', 'Camera', 'Film',
    'Music', 'Radio', 'Gamepad', 'Brain', 'Cloud', 'Sun', 'Moon',
    'Smile', 'ThumbsUp', 'Flag', 'Gift', 'Globe', 'Leaf', 'Diamond'
  ]

  // ─── AUTH CHECK + REACTIVE LISTENER ──────────────────────────
  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      setIsAdmin(data?.is_admin || false)
    }
    setLoading(false)
  }

  useEffect(() => {
    checkUser()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        checkUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
      }
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  // ─── DATA FETCHING ──────────────────────────────────────────
  useEffect(() => {
    if (!user || !isAdmin) return
    fetchNominees()
    fetchCategories()
    fetchRulesContent()
    fetchSettings()
    if (activeTab === 'dashboard') fetchDashboardData()
  }, [user, isAdmin, activeTab])

  // Initialize expanded categories whenever categoryList changes
  useEffect(() => {
    if (categoryList.length > 0) {
      setExpandedCategories(new Set(categoryList.map(c => c.id)))
    }
  }, [categoryList])

  async function fetchNominees() {
    const { data } = await supabase
      .from('nominees')
      .select('*')
      .order('created_at', { ascending: false })
    setNominees(data || [])
    setSelectedNominees(new Set())
  }

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
    setCategoryList(data || [])
    if (data) {
      setCategories(data.map(c => c.name))
      if (data.length > 0 && !nomineeForm.category) {
        setNomineeForm(prev => ({ ...prev, category: data[0].name }))
      }
    }
  }

  async function fetchRulesContent() {
    const { data } = await supabase
      .from('site_content')
      .select('content')
      .eq('key', 'rules')
      .single()
    if (data) setRulesContent(data.content)
  }

  async function fetchSettings() {
    const { data } = await supabase
      .from('site_content')
      .select('content')
      .eq('key', 'show_results')
      .single()
    if (data) setShowResults(data.content)
  }

  async function saveRulesContent() {
    setSavingContent(true)
    setContentMessage('')
    const { error } = await supabase
      .from('site_content')
      .update({ content: rulesContent, updated_at: new Date().toISOString() })
      .eq('key', 'rules')

    if (error) {
      setContentMessage('❌ Error: ' + error.message)
    } else {
      setContentMessage('✅ Rules page updated!')
    }
    setSavingContent(false)
  }

  // ─── DASHBOARD DATA ─────────────────────────────────────────
  async function fetchDashboardData() {
    setDashboardLoading(true)
    try {
      const { data: nomineesData, error: nomError } = await supabase
        .from('nominees')
        .select('category, title, votes_public')

      if (nomError) throw nomError

      const { count: totalCategories, error: catCountError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })

      if (catCountError) throw catCountError

      const totalVotes = nomineesData?.reduce((sum, n) => sum + (n.votes_public || 0), 0) || 0
      const totalNominees = nomineesData?.length || 0

      const grouped = (nomineesData || []).reduce((acc, n) => {
        if (!acc[n.category]) acc[n.category] = { totalVotes: 0, nominees: [] }
        acc[n.category].totalVotes += n.votes_public || 0
        acc[n.category].nominees.push(n)
        return acc
      }, {} as Record<string, { totalVotes: number; nominees: any[] }>)

      const categoryStats = Object.entries(grouped)
        .map(([category, data]) => ({
          category,
          totalVotes: data.totalVotes,
          nominees: data.nominees.sort((a, b) => (b.votes_public || 0) - (a.votes_public || 0))
        }))
        .sort((a, b) => b.totalVotes - a.totalVotes)

      setDashboardData({
        totalVotes,
        totalNominees,
        totalCategories: totalCategories || 0,
        categoryStats
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      alert('Failed to load dashboard data.')
    } finally {
      setDashboardLoading(false)
    }
  }

  // ─── BULK ACTIONS ───────────────────────────────────────────
  const toggleSelectNominee = (id: string) => {
    setSelectedNominees(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const selectAll = () => {
    if (selectedNominees.size === filteredNominees.length) {
      setSelectedNominees(new Set())
    } else {
      setSelectedNominees(new Set(filteredNominees.map(n => n.id)))
    }
  }

  const filteredNominees = useMemo(() => {
    return nominees.filter(n => 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.anime_name && n.anime_name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [nominees, searchTerm])

  const executeBulkAction = async () => {
    if (selectedNominees.size === 0) return alert('No nominees selected.')
    if (bulkAction === 'delete') {
      if (!confirm(`Delete ${selectedNominees.size} nominee(s)?`)) return
      setBulkProcessing(true)
      const { error } = await supabase
        .from('nominees')
        .delete()
        .in('id', Array.from(selectedNominees))
      if (error) {
        alert('Error: ' + error.message)
      } else {
        alert(`✅ Deleted ${selectedNominees.size} nominee(s).`)
        fetchNominees()
      }
      setBulkProcessing(false)
    } else if (bulkAction === 'move') {
      if (!targetCategory) return alert('Please select a target category.')
      if (!confirm(`Move ${selectedNominees.size} nominee(s) to "${targetCategory}"?`)) return
      setBulkProcessing(true)
      const { error } = await supabase
        .from('nominees')
        .update({ category: targetCategory })
        .in('id', Array.from(selectedNominees))
      if (error) {
        alert('Error: ' + error.message)
      } else {
        alert(`✅ Moved ${selectedNominees.size} nominee(s) to "${targetCategory}".`)
        fetchNominees()
        setTargetCategory('')
      }
      setBulkProcessing(false)
    }
    setBulkAction('')
    setSelectedNominees(new Set())
  }

  // ─── NOMINEE HANDLERS ──────────────────────────────────────
  async function addNominee(e: React.FormEvent) {
    e.preventDefault()
    if (!nomineeForm.title) return alert('Title is required')

    const { error } = await supabase.from('nominees').insert([{
      category: nomineeForm.category,
      title: nomineeForm.title,
      anime_name: nomineeForm.anime_name || null,
      image_url: nomineeForm.image_url || null,
      submitted_by: user?.id
    }])

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('✅ Nominee added!')
      resetNomineeForm()
      fetchNominees()
    }
  }

  function editNominee(nominee: any) {
    setEditingNomineeId(nominee.id)
    setNomineeForm({
      category: nominee.category,
      title: nominee.title,
      anime_name: nominee.anime_name || '',
      image_url: nominee.image_url || ''
    })
  }

  async function updateNominee(e: React.FormEvent) {
    e.preventDefault()
    if (!editingNomineeId) return
    if (!nomineeForm.title) return alert('Title is required')

    const { error } = await supabase
      .from('nominees')
      .update({
        category: nomineeForm.category,
        title: nomineeForm.title,
        anime_name: nomineeForm.anime_name || null,
        image_url: nomineeForm.image_url || null
      })
      .eq('id', editingNomineeId)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('✅ Nominee updated!')
      resetNomineeForm()
      fetchNominees()
    }
  }

  function resetNomineeForm() {
    setEditingNomineeId(null)
    setNomineeForm({
      category: categories[0] || '',
      title: '',
      anime_name: '',
      image_url: ''
    })
  }

  async function deleteNominee(id: string) {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('nominees').delete().eq('id', id)
    if (!error) fetchNominees()
  }

  // ─── CLOUDFLARE REBUILD HOOK ────────────────────────────────
  const triggerRebuild = async () => {
    try {
      const response = await fetch('https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/61bea573-fe05-49ed-89c5-512fc8fb7a60', {
        method: 'POST',
      });
      if (response.ok) {
        console.log('✅ Rebuild triggered successfully');
      } else {
        console.error('❌ Rebuild trigger failed', await response.text());
      }
    } catch (error) {
      console.error('❌ Error triggering rebuild:', error);
    }
  };

  // Debounced rebuild to avoid multiple triggers
  const debouncedRebuild = () => {
    clearTimeout(rebuildTimeout);
    rebuildTimeout = setTimeout(() => triggerRebuild(), 5000); // wait 5 seconds
  };

  // ─── CATEGORY HANDLERS ─────────────────────────────────────
  async function addCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryForm.name || !categoryForm.slug) return alert('Name and slug are required')
    const slug = categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    const maxOrder = categoryList.length > 0 ? Math.max(...categoryList.map(c => c.display_order || 0)) + 1 : 1
    const { error } = await supabase.from('categories').insert([{ ...categoryForm, slug, display_order: maxOrder }])
    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('✅ Category added!')
      setCategoryForm({ name: '', slug: '', icon_name: 'Trophy', color: 'group-hover:border-yellow-500/50', gradient: 'from-yellow-600/20', description: '' })
      fetchCategories()
      debouncedRebuild() // trigger rebuild for new category
    }
  }

  async function updateCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!editingCategoryId) return
    if (!categoryForm.name || !categoryForm.slug) return alert('Name and slug are required')
    const { error } = await supabase
      .from('categories')
      .update({
        name: categoryForm.name,
        slug: categoryForm.slug,
        icon_name: categoryForm.icon_name,
        color: categoryForm.color,
        gradient: categoryForm.gradient,
        description: categoryForm.description
      })
      .eq('id', editingCategoryId)
    if (error) {
      alert('Error: ' + error.message)
    } else {
      await debouncedRebuild(); // 👈 starts a new deployment (with delay)
      alert('✅ Category updated!');
      setEditingCategoryId(null);
      setCategoryForm({ name: '', slug: '', icon_name: 'Trophy', color: 'group-hover:border-yellow-500/50', gradient: 'from-yellow-600/20', description: '' });
      fetchCategories();
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('⚠️ This will also delete all nominees in this category. Are you sure?')) return
    const category = categoryList.find(c => c.id === id)
    if (category) await supabase.from('nominees').delete().eq('category', category.name)
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) {
      fetchCategories()
      fetchNominees()
      debouncedRebuild() // rebuild after deletion
    }
  }

  function editCategory(category: any) {
    setEditingCategoryId(category.id)
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      icon_name: category.icon_name,
      color: category.color,
      gradient: category.gradient,
      description: category.description || ''
    })
  }

  async function moveCategory(categoryId: string, direction: 'up' | 'down') {
    const currentIndex = categoryList.findIndex(c => c.id === categoryId)
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === categoryList.length - 1)
    ) return

    const swapWithIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const currentCat = categoryList[currentIndex]
    const swapCat = categoryList[swapWithIndex]

    setReordering(true)

    const { error: error1 } = await supabase
      .from('categories')
      .update({ display_order: swapCat.display_order })
      .eq('id', currentCat.id)

    const { error: error2 } = await supabase
      .from('categories')
      .update({ display_order: currentCat.display_order })
      .eq('id', swapCat.id)

    if (error1 || error2) {
      alert('Error reordering: ' + (error1?.message || error2?.message))
    } else {
      await fetchCategories()
      debouncedRebuild() // rebuild after reorder (if you want order changes reflected in nav)
    }
    setReordering(false)
  }

  // ─── GROUP NOMINEES BY CATEGORY ─────────────────────────────
  const groupedNominees = useMemo(() => {
    const grouped: Record<string, any[]> = {}
    nominees.forEach(n => {
      if (!grouped[n.category]) grouped[n.category] = []
      grouped[n.category].push(n)
    })
    return grouped
  }, [nominees])

  // ─── SORT CATEGORIES WITH SELECTED AT TOP ──────────────────
  const sortedCategories = useMemo(() => {
    if (!nomineeForm.category || categoryList.length === 0) return categoryList
    const selectedCat = categoryList.find(c => c.name === nomineeForm.category)
    if (!selectedCat) return categoryList
    const others = categoryList.filter(c => c.name !== nomineeForm.category)
    return [selectedCat, ...others]
  }, [categoryList, nomineeForm.category])

  // ─── TOGGLE CATEGORY EXPAND ─────────────────────────────────
  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const expandAll = () => {
    setExpandedCategories(new Set(categoryList.map(c => c.id)))
  }

  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

  // ─── RENDER ────────────────────────────────────────────────
  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white p-8">Loading...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">🔒 Admin Only</h1>
        <p className="text-gray-400 mb-4">You need to login first.</p>
        <Login compact={false} showReassurance={false} />
        <button
          onClick={() => router.push('/')}
          className="mt-4 text-sm text-gray-400 hover:text-white"
        >
          ← Go to Homepage
        </button>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">⛔ Access Denied</h1>
        <p className="text-gray-400 mb-4">You don't have admin permissions.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-white text-slate-950 px-6 py-3 rounded-full font-bold"
        >
          Go to Homepage
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/')
            }}
            className="text-sm text-gray-400 hover:text-white"
          >
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-white/10 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'text-white border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('nominees')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'nominees'
                ? 'text-white border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📋 Nominees
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'categories'
                ? 'text-white border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🏷️ Categories
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'content'
                ? 'text-white border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📄 Rules & Content
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">📊 Voting Dashboard</h2>
              <button
                onClick={fetchDashboardData}
                className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded border border-white/10"
              >
                🔄 Refresh
              </button>
            </div>

            {dashboardLoading && <p className="text-gray-400">Loading dashboard data...</p>}

            {dashboardData && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
                    <p className="text-sm text-gray-400">Total Votes Cast</p>
                    <p className="text-3xl font-bold">{dashboardData.totalVotes.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
                    <p className="text-sm text-gray-400">Total Nominees</p>
                    <p className="text-3xl font-bold">{dashboardData.totalNominees}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
                    <p className="text-sm text-gray-400">Total Categories</p>
                    <p className="text-3xl font-bold">{dashboardData.totalCategories}</p>
                  </div>
                </div>

                {/* Settings Toggle */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Results to Public</p>
                      <p className="text-sm text-gray-400">
                        When enabled, anyone can view the winners at /results.
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        const newValue = showResults === 'true' ? 'false' : 'true'
                        const { error } = await supabase
                          .from('site_content')
                          .update({ content: newValue })
                          .eq('key', 'show_results')
                        if (!error) {
                          setShowResults(newValue)
                          alert(`Results are now ${newValue === 'true' ? 'visible' : 'hidden'} to the public.`)
                        } else {
                          alert('Error updating setting')
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        showResults === 'true' ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          showResults === 'true' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Results Calculation */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5 mb-8">
                  <h3 className="font-bold mb-2">🏆 Calculate Winners</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    This will compute final scores (60% public + 40% jury) and store top 3 per category in the results table.
                    Any existing results will be overwritten.
                  </p>
                  <button
                    onClick={async () => {
                      if (!confirm('This will overwrite existing results. Continue?')) return
                      try {
                        const { error } = await supabase.rpc('calculate_results')
                        if (error) throw error
                        alert('✅ Winners calculated successfully!')
                      } catch (err: any) {
                        alert('❌ Error: ' + err.message)
                      }
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-6 py-3 rounded-full hover:scale-105 transition"
                  >
                    🏆 Calculate Winners
                  </button>
                </div>

                {/* Preview Winners */}
                <h3 className="text-lg font-bold mb-3">🏆 Current Top 3 by Category (Preview)</h3>
                <div className="space-y-4">
                  {dashboardData.categoryStats.map(stat => (
                    <div key={stat.category} className="border border-white/10 rounded-lg overflow-hidden">
                      <div className="bg-slate-800 px-4 py-2 flex justify-between items-center">
                        <h4 className="font-bold">{stat.category}</h4>
                        <span className="text-sm text-gray-400">{stat.totalVotes} votes</span>
                      </div>
                      <div className="p-4">
                        {/* Preview Top 3 */}
                        <div className="mb-3 bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                          <p className="text-sm text-green-400 font-semibold mb-2">🏆 Current Top 3 (Preview)</p>
                          <div className="space-y-1">
                            {stat.nominees.slice(0, 3).map((n, idx) => (
                              <div key={n.id} className="flex justify-between text-sm">
                                <span>
                                  {idx === 0 && '🥇 '}
                                  {idx === 1 && '🥈 '}
                                  {idx === 2 && '🥉 '}
                                  {n.title}
                                </span>
                                <span className="text-gray-400">{n.votes_public || 0} votes</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* All nominees in category */}
                        <details className="group">
                          <summary className="text-sm text-gray-400 cursor-pointer hover:text-white">
                            Show all {stat.nominees.length} nominees
                          </summary>
                          <div className="mt-2 space-y-1 pl-2">
                            {stat.nominees.map((n, i) => (
                              <div key={n.id} className="flex justify-between text-xs text-gray-500">
                                <span>{i+1}. {n.title}</span>
                                <span>{n.votes_public || 0}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Nominees Tab */}
        {activeTab === 'nominees' && (
          <>
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">
                {editingNomineeId ? '✏️ Edit Nominee' : '➕ Add New Nominee'}
              </h2>
              <form onSubmit={editingNomineeId ? updateNominee : addNominee} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category *</label>
                  <select
                    value={nomineeForm.category}
                    onChange={(e) => setNomineeForm({ ...nomineeForm, category: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                    required
                  >
                    {categoryList.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title/Name *</label>
                  <input
                    type="text"
                    value={nomineeForm.title}
                    onChange={(e) => setNomineeForm({ ...nomineeForm, title: e.target.value })}
                    placeholder="e.g. Solo Leveling"
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Anime Name (if different, optional)</label>
                  <input
                    type="text"
                    value={nomineeForm.anime_name}
                    onChange={(e) => setNomineeForm({ ...nomineeForm, anime_name: e.target.value })}
                    placeholder="e.g. Solo Leveling (Movie)"
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Image URL (optional)</label>
                  <input
                    type="url"
                    value={nomineeForm.image_url}
                    onChange={(e) => setNomineeForm({ ...nomineeForm, image_url: e.target.value })}
                    placeholder="https://example.com/poster.jpg"
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-6 py-3 rounded-full hover:scale-105 transition-all"
                  >
                    {editingNomineeId ? 'Update Nominee' : 'Add Nominee'}
                  </button>
                  {editingNomineeId && (
                    <button
                      type="button"
                      onClick={resetNomineeForm}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-6 py-3 rounded-full transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">📋 Current Nominees (grouped by category)</h2>
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
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="🔍 Search nominees by title or anime name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500"
                />
              </div>

              {/* Bulk Actions Bar */}
              {filteredNominees.length > 0 && (
                <div className="mb-4 p-3 bg-slate-800/70 rounded-lg flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedNominees.size === filteredNominees.length && filteredNominees.length > 0}
                      onChange={selectAll}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-300">
                      {selectedNominees.size} selected
                    </span>
                  </div>
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value as any)}
                    className="bg-slate-700 text-white px-3 py-1 rounded border border-white/10 text-sm"
                  >
                    <option value="">Bulk actions</option>
                    <option value="delete">Delete selected</option>
                    <option value="move">Move to category</option>
                  </select>
                  {bulkAction === 'move' && (
                    <select
                      value={targetCategory}
                      onChange={(e) => setTargetCategory(e.target.value)}
                      className="bg-slate-700 text-white px-3 py-1 rounded border border-white/10 text-sm"
                    >
                      <option value="">Select category</option>
                      {categoryList.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={executeBulkAction}
                    disabled={bulkProcessing || !bulkAction || (bulkAction === 'move' && !targetCategory)}
                    className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-1 rounded-full text-sm font-bold"
                  >
                    {bulkProcessing ? 'Processing...' : 'Apply'}
                  </button>
                </div>
              )}

              {nominees.length === 0 ? (
                <p className="text-gray-400">No nominees yet. Add one above!</p>
              ) : (
                <div className="space-y-6">
                  {sortedCategories.map(cat => {
                    const catNominees = (groupedNominees[cat.name] || []).filter(n => 
                      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (n.anime_name && n.anime_name.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    if (catNominees.length === 0) return null

                    const isExpanded = expandedCategories.has(cat.id)

                    return (
                      <div key={cat.id} className="border border-white/10 rounded-lg overflow-hidden">
                        <div
                          className="bg-slate-800 px-4 py-2 flex justify-between items-center cursor-pointer hover:bg-slate-700 transition-colors"
                          onClick={() => toggleCategory(cat.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-lg">
                              {isExpanded ? '▼' : '▶'}
                            </span>
                            <h3 className="font-bold text-lg">{cat.name}</h3>
                          </div>
                          <span className="text-xs text-gray-500">Click to {isExpanded ? 'collapse' : 'expand'}</span>
                        </div>
                        {isExpanded && (
                          <div className="divide-y divide-white/5">
                            {catNominees.map((n) => (
                              <div key={n.id} className="flex items-center gap-3 bg-slate-900/50 p-4 hover:bg-slate-800/50 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={selectedNominees.has(n.id)}
                                  onChange={() => toggleSelectNominee(n.id)}
                                  className="w-4 h-4"
                                />
                                <div className="flex-1">
                                  <p className="font-medium">{n.title}</p>
                                  {n.anime_name && <p className="text-sm text-gray-400">{n.anime_name}</p>}
                                  <p className="text-xs text-gray-500 mt-1">Votes: {n.votes_public}</p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <button
                                    onClick={() => editNominee(n)}
                                    className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded border border-blue-500/30 hover:border-blue-500/50"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteNominee(n.id)}
                                    className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded border border-red-500/30 hover:border-red-500/50"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <>
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">
                {editingCategoryId ? '✏️ Edit Category' : '➕ Add New Category'}
              </h2>
              <form onSubmit={editingCategoryId ? updateCategory : addCategory} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => {
                      setCategoryForm({
                        ...categoryForm,
                        name: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
                      })
                    }}
                    placeholder="e.g. Best New Animation"
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Slug (URL) *</label>
                  <input
                    type="text"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    placeholder="best-new-animation"
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Used in URL: /category/your-slug</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Icon</label>
                  <select
                    value={categoryForm.icon_name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon_name: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                  >
                    {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Color Class (Tailwind)</label>
                  <input
                    type="text"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    placeholder="group-hover:border-yellow-500/50"
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Gradient Class (Tailwind)</label>
                  <input
                    type="text"
                    value={categoryForm.gradient}
                    onChange={(e) => setCategoryForm({ ...categoryForm, gradient: e.target.value })}
                    placeholder="from-yellow-600/20"
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Brief description of the category"
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-6 py-3 rounded-full hover:scale-105 transition-all"
                  >
                    {editingCategoryId ? 'Update Category' : 'Add Category'}
                  </button>
                  {editingCategoryId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryId(null)
                        setCategoryForm({ name: '', slug: '', icon_name: 'Trophy', color: 'group-hover:border-yellow-500/50', gradient: 'from-yellow-600/20', description: '' })
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-6 py-3 rounded-full transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">🏷️ Current Categories</h2>
              {categoryList.length === 0 ? (
                <p className="text-gray-400">No categories yet. Add one above!</p>
              ) : (
                <div className="space-y-4">
                  {categoryList.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg">
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-sm text-gray-400">Slug: {cat.slug} • Icon: {cat.icon_name}</p>
                        {cat.description && <p className="text-xs text-gray-500 mt-1">{cat.description}</p>}
                      </div>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => moveCategory(cat.id, 'up')}
                          disabled={reordering}
                          className="text-gray-400 hover:text-white disabled:opacity-30 px-2 py-1"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveCategory(cat.id, 'down')}
                          disabled={reordering}
                          className="text-gray-400 hover:text-white disabled:opacity-30 px-2 py-1"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => editCategory(cat)}
                          className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded border border-blue-500/30 hover:border-blue-500/50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded border border-red-500/30 hover:border-red-500/50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">📄 Rules Page Content</h2>
            <p className="text-gray-400 text-sm mb-4">
              Edit the text below. You can use Markdown for formatting (headings, lists, bold, etc.).
            </p>
            <textarea
              value={rulesContent}
              onChange={(e) => setRulesContent(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm"
              rows={20}
              placeholder="# Voting Rules..."
            />
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={saveRulesContent}
                disabled={savingContent}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-6 py-3 rounded-full transition-all disabled:opacity-50"
              >
                {savingContent ? 'Saving...' : '💾 Save Changes'}
              </button>
              {contentMessage && (
                <span className={`text-sm ${contentMessage.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                  {contentMessage}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
    }
