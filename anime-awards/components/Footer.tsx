import Link from 'next/link'
import { FaDiscord, FaRedditAlien, FaGithub } from 'react-icons/fa'
import { HiOutlineShieldCheck } from 'react-icons/hi'

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/10 bg-gradient-to-b from-slate-950/95 to-slate-900/95 backdrop-blur-sm">
      {/* Animated gradient line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-gray-400">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent mb-3">
              r/AnimeIndian Awards
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              The biggest community-driven anime awards. 
              One person, one vote. Celebrating the best of Indian anime fandom.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a 
                href="https://discord.com/invite/jZ85M2GgXS" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-[#5865F2]/10 hover:bg-[#5865F2] text-[#5865F2] hover:text-white rounded-lg transition-all"
                aria-label="Discord"
              >
                <FaDiscord size={20} />
              </a>
              <a 
                href="https://reddit.com/r/animeindian" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white rounded-lg transition-all"
                aria-label="Subreddit"
              >
                <FaRedditAlien size={20} />
              </a>
            
              <span className="text-xs text-gray-500 flex items-center gap-1 ml-2">
                <span className="animate-pulse">💜</span> Made with love by Otaku Bhaskar Team
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Navigate</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-white transition-colors">
                  Rules & Info
                </Link>
              </li>
              <li>
                <a 
                  href="https://reddit.com/r/animeindian" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Subreddit
                </a>
              </li>
            </ul>
          </div>

          {/* Integrity Badge */}
          <div className="flex flex-col items-start md:items-end">
            <div className="flex items-center gap-2 text-xs bg-white/5 px-4 py-3 rounded-2xl border border-white/10">
              <HiOutlineShieldCheck className="text-green-400 text-xl" />
              <div>
                <p className="text-white font-medium">Verified Voting</p>
                <p className="text-gray-400">60% Public · 40% Jury</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              © 2026 r/AnimeIndian. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
