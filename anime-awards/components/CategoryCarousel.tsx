'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate, useSpring } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { fetchFromAPI } from '@/utils/api'
import CategoryCard from './CategoryCard'

export default function CategoryCarousel() {
    const router = useRouter()
    const [categories, setCategories] = useState<any[]>([])
    const containerRef = useRef<HTMLDivElement>(null)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [cardWidth, setCardWidth] = useState(320)
    const [activeIndex, setActiveIndex] = useState(0)

    // Fetch categories
    useEffect(() => {
        async function load() {
            const data = await fetchFromAPI('/categories?select=*&order=display_order.asc')
            setCategories(data || [])
        }
        load()
    }, [])

    // Track mouse position relative to window center
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const centerX = window.innerWidth / 2
            const centerY = window.innerHeight / 2
            setMousePosition({
                x: (e.clientX - centerX) / (window.innerWidth / 2),
                y: (e.clientY - centerY) / (window.innerHeight / 2),
            })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    // Calculate card transforms based on mouse and index
    const getCardTransform = (index: number) => {
        const offset = index - activeIndex
        const baseRotateY = offset * 15 // Base rotation for carousel effect
        const mouseRotateY = mousePosition.x * 5 // Mouse influence
        const mouseRotateX = -mousePosition.y * 3

        return {
            rotateY: baseRotateY + mouseRotateY,
            rotateX: mouseRotateX,
            z: offset === 0 ? 100 : 0, // Active card pops forward
            scale: 1 - Math.abs(offset) * 0.15,
            opacity: 1 - Math.abs(offset) * 0.3,
        }
    }

    // Handle card click – expand to category page
    const expandCategory = (slug: string) => {
        // Animate expansion – we'll use a shared layout animation
        router.push(`/category/${slug}`)
        // For a more fluid transition, consider using Framer Motion's AnimatePresence and layoutId
    }

    if (!categories.length) return null

    return (
        <div
            ref={containerRef}
            className="relative w-full h-[600px] overflow-hidden bg-slate-950"
            style={{ perspective: '1200px' }}
        >
            {/* Gradient edges for peek effect */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative" style={{ width: cardWidth * categories.length, transformStyle: 'preserve-3d' }}>
                    {categories.map((cat, index) => {
                        const transform = getCardTransform(index)
                        return (
                            <motion.div
                                key={cat.id}
                                className="absolute left-1/2 top-1/2 cursor-pointer"
                                style={{
                                    x: '-50%',
                                    y: '-50%',
                                    translateX: `${(index - activeIndex) * (cardWidth + 24)}px`,
                                    rotateY: transform.rotateY,
                                    rotateX: transform.rotateX,
                                    z: transform.z,
                                    scale: transform.scale,
                                    opacity: transform.opacity,
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                onClick={() => expandCategory(cat.slug)}
                            >
                                <CategoryCard
                                    category={cat}
                                    isActive={index === activeIndex}
                                    onExpand={() => expandCategory(cat.slug)}
                                />
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Swipe indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm">
                ← Drag to scroll → • ↑ Pull up to expand
            </div>
        </div>
    )
}