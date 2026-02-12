import Link from 'next/link'
import { FaDiscord, FaRedditAlien, FaGithub } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/10 bg-gradient-to-b from-slate-950/95 to-slate-900/95 backdrop-blur-sm">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Main row: Brand + Navigate + Copyright */}
        <div className="flex flex-col md:flex-row md:justify-between gap-8 md:gap-12">
          
          {/* Brand Section - left */}
          <div className="md:flex-1 md:max-w-xl">
            {/* Badge - this adds ~32px height */}
            <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 text-xs font-medium text-orange-300 mb-3">
              Otaku Bhaskar presents
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent mb-2">
              r/AnimeIndian Awards
            </h3>
            <p className="text-gray-400 text-sm max-w-md mb-3">
              One person, one vote. Celebrating the best of Indian anime fandom.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="https://discord.com/invite/jZ85M2GgXS" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-[#5865F2]/10 hover:bg-[#5865F2] text-[#5865F2] hover:text-white rounded-lg transition-all"
              >
                <FaDiscord size={20} />
              </a>
              <a 
                href="https://reddit.com/r/animeindian" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white rounded-lg transition-all"
              >
                <FaRedditAlien size={20} />
              </a>
            </div>
          </div>

          {/* Navigate Column - center */}
          <div className="md:w-40">
            {/* 👇 SPACER – matches badge height to align title with title */}
            <div className="h-[32px] md:block"></div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Navigate</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-gray-400 hover:text-white transition-colors">
                  Rules & Info
                </Link>
              </li>
              <li>
                <a 
                  href="https://reddit.com/r/animeindian" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Subreddit
                </a>
              </li>
            </ul>
          </div>

          {/* Copyright & Credit - right */}
          <div className="md:text-right">
            {/* 👇 SPACER – matches badge height */}
            <div className="h-[32px] md:block"></div>
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                © 2026 r/AnimeIndian. All rights reserved.
              </p>
              <p className="text-xs text-gray-600 flex items-center md:justify-end gap-1">
                <span>💜 Made with love by</span>
                <a 
                  href="https://www.reddit.com/r/animeindian/s/RGJidGAzub" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300 transition-colors"
                >
                  Otaku Bhaskar Team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
              }
