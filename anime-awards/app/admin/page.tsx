'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Login from '@/components/Login'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'nominees' | 'categories' | 'content'>('nominees')
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

  // ----- Site Content State -----
  const [rulesContent, setRulesContent] = useState('')
  const [savingContent, setSavingContent] = useState(false)
  const [contentMessage, setContentMessage] = useState('')

  // Available icons
  const iconOptions = [
    'Trophy', 'Clapperboard', 'Mic', 'Flame', 'Zap', 'Heart', 'Tv', 'Star',
    'Sword', 'Crown', 'Award', 'Medal', 'Sparkles', 'Camera', 'Film',
    'Music', 'Radio', 'Gamepad', 'Brain', 'Cloud', 'Sun', 'Moon',
    'Smile', 'ThumbsUp', 'Flag', 'Gift', 'Globe', 'Leaf', 'Diamond'
  ]

  useEffect(() => {
    checkUser()
    fetchNominees()
    fetchCategories()
    fetchRulesContent()
  }, [])

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

  async function fetchNominees() {
    const { data } = await supabase
      .from('nominees')
      .select('*')
      .order('created_at', { ascending: false })
    setNominees(data || [])
  }

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
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

  // ----- Nominee Handlers -----
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

  // ----- Category Handlers -----
  async function addCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryForm.name || !categoryForm.slug) return alert('Name and slug are required')
    const slug = categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    const { error } = await supabase.from('categories').insert([{ ...categoryForm, slug }])
    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('✅ Category added!')
      setCategoryForm({ name: '', slug: '', icon_name: 'Trophy', color: 'group-hover:border-yellow-500/50', gradient: 'from-yellow-600/20', description: '' })
      fetchCategories()
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
      alert('✅ Category updated!')
      setEditingCategoryId(null)
      setCategoryForm({ name: '', slug: '', icon_name: 'Trophy', color: 'group-hover:border-yellow-500/50', gradient: 'from-yellow-600/20', description: '' })
      fetchCategories()
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

  const [editingNomineeId, setEditingNomineeId] = useState<string | null>(null)

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
              <h2 className="text-xl font-bold mb-4">📋 Current Nominees</h2>
              {nominees.length === 0 ? (
                <p className="text-gray-400">No nominees yet. Add one above!</p>
              ) : (
                <div className="space-y-4">
                  {nominees.map((n) => (
                    <div key={n.id} className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg">
                      <div>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-sm text-gray-400">{n.category} • Votes: {n.votes_public}</p>
                      </div>
                      <div className="flex gap-2">
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
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') })}
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
                      <div className="flex gap-2">
                        <button onClick={() => editCategory(cat)} className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded border border-blue-500/30 hover:border-blue-500/50">
                          Edit
                        </button>
                        <button onClick={() => deleteCategory(cat.id)} className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded border border-red-500/30 hover:border-red-500/50">
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
