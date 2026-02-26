'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X, ThumbsUp, ArrowLeft } from 'lucide-react'
import { fetchFromAPI } from '@/utils/api'

interface CategoryExpandedOverlayProps {
    category: {
        id: string
        name: string
        slug: string
        description?: string
    }
    onClose: () => void
}

export default function CategoryExpandedOverlay({ category, onClose }: CategoryExpandedOverlayProps) {
    const [nominees, setNominees] = useState<any[]>([])

    useEffect(() => {
        async function load() {
            const data = await fetchFromAPI(
                `/nominees?select=*&category=eq.${encodeURIComponent(category.name)}&order=created_at.asc`
            )
            setNominees(data || [])
        }
        load()
    }, [category])

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed inset-0 bg-slate-950 z-50 flex flex-col"
            drag="y"
            dragConstraints={{ top: 0, bottom: 100 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
                if (info.offset.y > 100) onClose()
            }}
        >
            {/* Header with back button */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                    {category.name}
                </h2>
                <div className="w-10" /> {/* spacer */}
            </div>

            {/* Nominees list – fill remaining space */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {nominees.map((nom) => (
                    <div
                        key={nom.id}
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                        {nom.image_url && (
                            <img
                                src={nom.image_url}
                                alt={nom.title}
                                className="w-16 h-16 object-cover rounded-lg"
                            />
                        )}
                        <div className="flex-1">
                            <p className="font-semibold">{nom.title}</p>
                            {nom.anime_name && (
                                <p className="text-sm text-gray-400">{nom.anime_name}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold">{nom.votes_public}</p>
                            <p className="text-xs text-gray-400">votes</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pull down handle (optional) */}
            <div className="flex justify-center py-2">
                <div className="w-12 h-1 bg-gray-600 rounded-full" />
            </div>
        </motion.div>
    )
}