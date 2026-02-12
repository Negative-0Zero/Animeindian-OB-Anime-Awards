'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import Login from '@/components/Login'
import VoteButton from '@/components/VoteButton'
import { Trophy, Calendar, Star, Flame, Heart, Zap, Clapperboard, Mic, Tv } from "lucide-react"

// ─── SEASON CONFIG ─────────────────────────────────────────────
const SEASON = {
    name: "Winter 2026",
    liveBadge: "Winter 2026",
    titleLine2: "WINTER 2026 AWARDS",
    animeOf: "Anime of the Season",
    movieOf: "Movie of the Season",
    animeDesc: "The absolute peak fiction of Winter 2026.",
    movieDesc: "The best cinematic experience of the season.",
    timelineNominations: "Jan 15 – Feb 10",
    timelineVoting: "Feb 11 – Feb 28",
    timelineWinners: "With Otaku Bhaskar"
}

// ─── CATEGORY ICONS & STYLES ─────────────────────────────────
const categoryStyles: Record<string, { icon: JSX.Element, color: string, gradient: string }> = {
    'Anime of the Season': {
        icon: <Trophy className="text-yellow-400" />,
        color: 'group-hover:border-yellow-500/50',
        gradient: 'from-yellow-600/20'
    },
    'Movie of the Season': {
        icon: <Clapperboard className="text-purple-400" />,
        color: 'group-hover:border-purple-500/50',
        gradient: 'from-purple-600/20'
    },
    'Best Hindi Dub': {
        icon: <Mic className="text-orange-400" />,
        color: 'group-hover:border-orange-500/50',
        gradient: 'from-orange-600/20'
    },
    'Indian Theatrical Experience': {
        icon: <TicketIcon />,
        color: 'group-hover:border-red-500/50',
        gradient: 'from-red-600/20'
    },
    'Best Shonen': {
        icon: <Flame className="text-red-400" />,
        color: 'group-hover:border-red-500/50',
        gradient: 'from-red-600/20'
    },
    'Best Action': {
        icon: <Zap className="text-blue-400" />,
        color: 'group-hover:border-blue-500/50',
        gradient: 'from-blue-600/20'
    },
    'Best Romance': {
        icon: <Heart className="text-pink-400" />,
        color: 'group-hover:border-pink-500/50',
        gradient: 'from-pink-600/20'
    },
    'Best Isekai': {
        icon: <Tv className="text-green-400" />,
        color: 'group-hover:border-green-500/50',
        gradient: 'from-green-600/20'
    },
    'Bachpan Ka Pyaar': {
        icon: <Star className="text-indigo-400" />,
        color: 'group-hover:border-indigo-500/50',
        gradient: 'from-indigo-600/20'
    }
}

// Convert category name to URL slug
function categoryToSlug(category: string): string {
    return category
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
}

export default function Home() {
    const [nomineesByCategory, setNomineesByCategory] = useState<Record<string, any[]>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchNominees()
    }, [])

    async function fetchNominees() {
        setLoading(true)
        const { data, error } = await supabase
            .from('nominees')
            .select('*')
            .order('created_at', { ascending: true })

        if (!error && data) {
            const grouped = data.reduce((acc, nominee) => {
                if (!acc[nominee.category]) acc[nominee.category] = []
                acc[nominee.category].push(nominee)
                return acc
            }, {} as Record<string, any[]>)
            setNomineesByCategory(grouped)
        }
        setLoading(false)
    }

    const showTimeline = () => {
        alert(`🗓️ Voting Timeline – ${SEASON.name}:\n\n• Nominations: ${SEASON.timelineNominations}\n• Voting: ${SEASON.timelineVoting}\n• Winners Announced: ${SEASON.timelineWinners}`)
    }

    return (
        <main className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white">

            {/* ─── HEADER: PROFILE/EXIT (ONLY VISIBLE WHEN LOGGED IN) ─── */}
            <header className="absolute top-4 right-4 z-50">
                <Login compact={false} hideWhenLoggedOut={true} />
            </header>

            {/* ─── HERO SECTION ─────────────────────────── */}
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
                        <span className="text-white font-bold">{SEASON.animeOf}</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <VoteButton
                            nomineeId="hero-placeholder"
                            category={SEASON.animeOf}
                            isHero={true}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 font-black text-lg rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-2"
                        >
                            <Trophy size={20} className="text-yellow-600" />
                            VOTE NOW
                        </VoteButton>
                        <button
                            onClick={showTimeline}
                            className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-md text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <Calendar size={20} />
                            Timeline
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── LOGIN SECTION ─────────────────────────── */}
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
                                🔐 Your email is only used for authentication and to prevent duplicate votes – we never share it or post anything.
                            </p>
                        </div>
                        <div className="md:w-1/2 w-full">
                            <Login compact={false} showReassurance={true} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── CATEGORIES SECTION – DYNAMIC NOMINEES, NO VOTE COUNTS ─── */}
            <section id="categories-section" className="max-w-7xl mx-auto px-4 py-12">
                <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 flex items-center justify-center gap-3 text-center">
                        <Star className="text-yellow-400 fill-yellow-400" />
                        The Categories – {SEASON.name}
                    </h2>

                    {loading ? (
                        <p className="text-center text-gray-400">Loading nominees...</p>
                    ) : (
                        <div className="space-y-12">
                            {Object.entries(categoryStyles).map(([catName, styles]) => {
                                const nominees = nomineesByCategory[catName] || []

                                if (nominees.length === 0) {
                                    return (
                                        <div key={catName} className="border border-white/10 rounded-2xl p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-3 bg-white/5 rounded-lg">{styles.icon}</div>
                                                <h3 className="text-2xl font-bold">{catName}</h3>
                                            </div>
                                            <p className="text-gray-400">No nominees added yet. Check back soon!</p>
                                        </div>
                                    )
                                }

                                return (
                                    <div key={catName} className="border border-white/10 rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 bg-white/5 rounded-lg">{styles.icon}</div>
                                            <h3 className="text-2xl font-bold">{catName}</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {nominees.map((nominee) => (
                                                <div
                                                    key={nominee.id}
                                                    className="bg-slate-800/50 rounded-xl p-4 border border-white/5 hover:border-white/20 transition-all"
                                                >
                                                    {nominee.image_url && (
                                                        <img
                                                            src={nominee.image_url}
                                                            alt={nominee.title}
                                                            className="w-full h-32 object-cover rounded-lg mb-3"
                                                        />
                                                    )}
                                                    <h4 className="font-bold text-lg">{nominee.title}</h4>
                                                    {nominee.anime_name && (
                                                        <p className="text-sm text-gray-400">{nominee.anime_name}</p>
                                                    )}
                                                    <div className="mt-4 flex items-center justify-between">
                                                        <VoteButton
                                                            nomineeId={nominee.id}
                                                            category={catName}
                                                            onVoteSuccess={fetchNominees}
                                                        />
                                                        <Link
                                                            href={`/category/${categoryToSlug(catName)}`}
                                                            className="text-xs text-gray-400 hover:text-white transition-colors"
                                                        >
                                                            View nominees →
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}

// ─── CUSTOM TICKET ICON ────────────────────────────────
function TicketIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
        </svg>
    )
}