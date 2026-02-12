'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
    const [user, setUser] = useState<any>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [nominees, setNominees] = useState<any[]>([])
    const router = useRouter()

    const [category, setCategory] = useState('Anime of the Season')
    const [title, setTitle] = useState('')
    const [animeName, setAnimeName] = useState('')
    const [imageUrl, setImageUrl] = useState('')

    const categories = [
        'Anime of the Season',
        'Movie of the Season',
        'Best Hindi Dub',
        'Indian Theatrical Experience',
        'Best Shonen',
        'Best Action',
        'Best Romance',
        'Best Isekai',
        'Bachpan Ka Pyaar'
    ]

    useEffect(() => {
        checkUser()
        fetchNominees()
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

    async function addNominee(e: React.FormEvent) {
        e.preventDefault()
        if (!title) return alert('Title is required')

        const { error } = await supabase.from('nominees').insert([{
            category,
            title,
            anime_name: animeName || null,
            image_url: imageUrl || null,
            submitted_by: user?.id
        }])

        if (error) {
            alert('Error: ' + error.message)
        } else {
            alert('✅ Nominee added!')
            setTitle('')
            setAnimeName('')
            setImageUrl('')
            fetchNominees()
        }
    }

    async function deleteNominee(id: string) {
        if (!confirm('Are you sure?')) return
        const { error } = await supabase.from('nominees').delete().eq('id', id)
        if (!error) fetchNominees()
    }

    if (loading) {
        return <div className="min-h-screen bg-slate-950 text-white p-8">Loading...</div>
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">🔒 Admin Only</h1>
                <p className="text-gray-400 mb-4">You need to login first.</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-white text-slate-950 px-6 py-3 rounded-full font-bold"
                >
                    Go to Homepage
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

                {/* Add Nominee Form */}
                <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">➕ Add New Nominee</h2>
                    <form onSubmit={addNominee} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Category *</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Title/Name *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Solo Leveling"
                                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Anime Name (if different, optional)</label>
                            <input
                                type="text"
                                value={animeName}
                                onChange={(e) => setAnimeName(e.target.value)}
                                placeholder="e.g. Solo Leveling (Movie)"
                                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Image URL (optional)</label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/poster.jpg"
                                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-6 py-3 rounded-full hover:scale-105 transition-all"
                        >
                            Add Nominee
                        </button>
                    </form>
                </div>

                {/* Existing Nominees */}
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
                                    <button
                                        onClick={() => deleteNominee(n.id)}
                                        className="text-red-400 hover:text-red-300 text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}