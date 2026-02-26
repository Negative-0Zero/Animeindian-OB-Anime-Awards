'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { iconMap } from '@/utils/iconMap'

interface CategoryCardProps {
    category: {
        id: string
        name: string
        description?: string
        icon_name: string
        color?: string
        gradient?: string
        slug: string
    }
    isActive: boolean
    onExpand: () => void
}

export default function CategoryCard({ category, isActive, onExpand }: CategoryCardProps) {
    const pullY = useMotionValue(0)
    const pullProgress = useTransform(pullY, [-100, 0], [1, 0]) // 0 to 1 as pulled up
    const cardScale = useTransform(pullProgress, [0, 1], [1, 1.05])
    const backgroundOpacity = useTransform(pullProgress, [0, 1], [1, 0.9])

    const handleDragEnd = () => {
        const y = pullY.get()
        if (y < -50) {
            onExpand()
        }
        animate(pullY, 0, { type: 'spring', stiffness: 300, damping: 30 })
    }

    const IconComponent = iconMap[category.icon_name] || iconMap.Trophy

    return (
        <motion.div
            drag={isActive ? 'y' : false}
            dragConstraints={{ top: -100, bottom: 0 }}
            dragElastic={0.2}
            style={{
                y: pullY,
                scale: cardScale,
                opacity: backgroundOpacity,
            }}
            onDragEnd={handleDragEnd}
            className={`
                                                                                                                                                        w-80 h-96 rounded-3xl p-6 cursor-pointer
                                                                                                                                                                bg-white/10 backdrop-blur-xl border border-white/20
                                                                                                                                                                        shadow-2xl flex flex-col justify-between relative overflow-hidden
                                                                                                                                                                                ${category.color || 'hover:border-white/40'}
                                                                                                                                                                                      `}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {/* Water filling effect overlay */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-t from-orange-500/30 to-transparent pointer-events-none"
                style={{ opacity: pullProgress }}
            />

            <div className="relative z-10">
                <div className="mb-4 p-3 bg-white/5 w-fit rounded-xl border border-white/10">
                    <IconComponent className="text-4xl" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                <p className="text-sm text-gray-300">{category.description}</p>
            </div>

            {/* Pull strip – colored bar at bottom */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-orange-500 to-transparent cursor-grab active:cursor-grabbing"
                style={{ y: pullY }}
                drag={isActive ? 'y' : false}
                dragConstraints={{ top: -100, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
            >
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/50 rounded-full" />
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/80">
                    Pull up
                </span>
            </motion.div>
        </motion.div>
    )
}