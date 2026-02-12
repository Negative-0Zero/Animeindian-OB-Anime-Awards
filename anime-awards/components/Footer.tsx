import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20 py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
        {/* Copyright */}
        <p>© 2026 r/AnimeIndian Awards. All rights reserved.</p>
        
        {/* Social & Links */}
        <div className="flex gap-6 mt-4 md:mt-0">
          <a 
            href="https://discord.gg/your-invite" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            Discord
          </a>
          <a 
            href="https://reddit.com/r/animeindian" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            Subreddit
          </a>
          <Link href="/rules" className="hover:text-white transition">
            Rules
          </Link>
        </div>
      </div>
    </footer>
  )
}
