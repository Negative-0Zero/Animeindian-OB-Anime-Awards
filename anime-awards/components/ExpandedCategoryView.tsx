'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { fetchFromAPI } from '@/utils/api'

interface ExpandedCategoryViewProps {
    category: {
        id: string
        name: string
        slug: string
        description?: string
    }
    onClose: () => void
}

export default function ExpandedCategoryView({ category, onClose }: ExpandedCategoryViewProps) {
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
            className="fixed inset-x-0 bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl p-6 z-50 max-h-[90vh] overflow-y-auto"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                    {category.name}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                    <X size={24} />
                </button>
            </div>

            {/* Nominees list */}
            <div className="space-y-4">
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

            {/* Pull down handle */}
            <div className="flex justify-center mt-6">
                <div
                    className="w-16 h-1.5 bg-gray-500 rounded-full cursor-pointer"
                    onClick={onClose}
                />
            </div>
        </motion.div>
    )
}