import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../contexts/ThemeContext'

const CASES = [
  { id: 1, title: "A love letter unsealed after 10 years", tag: "Time" },
  { id: 2, title: "Founder's will, opened by partners only", tag: "Trust" },
  { id: 3, title: "Evidence submitted to court, timestamped", tag: "Truth" },
  { id: 4, title: "Last message to family, sealed until...", tag: "Time" },
  { id: 5, title: "Business agreement between strangers", tag: "Trust" },
  { id: 6, title: "Police report, chain of custody intact", tag: "Truth" },
]

export default function Home() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()

  const handleUnlock = async () => {
    if (!code.trim()) { setError('Enter a seal code'); return }
    setLoading(true)
    setError('')

    const { data } = await supabase
      .from('vows')
      .select('id')
      .eq('access_code', code.trim())
      .single()

    setLoading(false)
    if (data) {
      navigate(`/view/${code.trim()}`)
    } else {
      setError('No sealed box found with that code')
    }
  }

  return (
    <div className="min-h-screen flex relative">
      {/* Theme Toggle */}
      <button
        onClick={toggle}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title={dark ? 'Switch to light' : 'Switch to dark'}
      >
        {dark ? (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      {/* LEFT: Vault */}
      <div className="w-2/3 flex flex-col items-center justify-center p-12 relative">
        {/* Vault SVG */}
        <div className="relative w-72 h-72 mb-6">
          <svg viewBox="0 0 320 320" className="w-full h-full">
            <defs>
              <radialGradient id="vaultGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3a3a5c"/>
                <stop offset="100%" stopColor="#1a1a2e"/>
              </radialGradient>
              <radialGradient id="dialGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c9a84c"/>
                <stop offset="60%" stopColor="#8b7332"/>
                <stop offset="100%" stopColor="#5a4a1e"/>
              </radialGradient>
            </defs>
            <circle cx="160" cy="160" r="150" fill="url(#vaultGrad)" stroke="#c9a84c" strokeWidth="4"/>
            <circle cx="160" cy="160" r="130" fill="none" stroke="#c9a84c33" strokeWidth="1"/>
            <circle cx="160" cy="160" r="100" fill="none" stroke="#c9a84c22" strokeWidth="1"/>
            <circle cx="160" cy="160" r="55" fill="url(#dialGrad)" style={{animation: 'dial-spin 20s linear infinite'}}/>
            <circle cx="160" cy="160" r="45" fill="#1a1a2e" stroke="#c9a84c" strokeWidth="2"/>
            <circle cx="160" cy="160" r="8" fill="#c9a84c"/>
            {Array.from({length: 12}).map((_, i) => {
              const angle = (i * 30 - 90) * Math.PI / 180
              const x1 = 160 + Math.cos(angle) * 50
              const y1 = 160 + Math.sin(angle) * 50
              const x2 = 160 + Math.cos(angle) * 42
              const y2 = 160 + Math.sin(angle) * 42
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9a84c" strokeWidth="1.5"/>
            })}
            <line x1="160" y1="220" x2="160" y2="270" stroke="#c9a84c" strokeWidth="6" strokeLinecap="round"/>
            <circle cx="160" cy="275" r="8" fill="none" stroke="#c9a84c" strokeWidth="3"/>
            {[45,135,225,315].map(angle => {
              const rad = angle * Math.PI / 180
              const cx = 160 + Math.cos(rad) * 145
              const cy = 160 + Math.sin(rad) * 145
              return <circle key={angle} cx={cx} cy={cy} r="6" fill="#c9a84c"/>
            })}
          </svg>
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-2 dark:text-white">
          SEAL<span className="text-vault-gold">BOX</span>
          <span className="text-lg text-gray-400 dark:text-gray-500 ml-1">.xyz</span>
        </h1>

        <div className="w-full max-w-sm mt-6">
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              placeholder="Enter seal code..."
              className="w-full px-5 py-4 text-lg text-center border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-vault-gold focus:outline-none transition-colors bg-gray-50 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              autoFocus
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-vault-gold border-t-transparent rounded-full animate-spin"/>
              </div>
            )}
          </div>
          {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}

          <button
            onClick={handleUnlock}
            disabled={loading}
            className="w-full mt-3 py-4 bg-vault-dark text-white rounded-xl font-medium hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            Unlock
          </button>
        </div>

        <p className="text-sm text-gray-400 dark:text-gray-500 mt-4 tracking-wide uppercase">
          eXact words. Yours alone. Zero compromise.
        </p>

        <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-100 dark:border-green-800">
          <svg className="w-4 h-4 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs text-green-700 dark:text-green-400 font-medium">End-to-end encrypted. We can't read your content.</span>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => navigate('/write')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-vault-gold transition-colors underline underline-offset-4"
          >
            Seal something
          </button>
          <button
            onClick={() => navigate('/receive')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-vault-gold transition-colors underline underline-offset-4"
          >
            I have a code
          </button>
        </div>
      </div>

      {/* RIGHT: XYZ Axes + Cases */}
      <div className="w-1/3 bg-gray-50 dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 flex flex-col p-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-red-400">X</span>
            <span className="text-3xl font-bold text-blue-400">Y</span>
            <span className="text-3xl font-bold text-green-400">Z</span>
          </div>
          <div className="flex gap-6 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full"/> eXact</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded-full"/> Yours</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full"/> Zero</span>
          </div>
        </div>

        <div className="relative h-40 mb-6">
          <svg viewBox="0 0 300 160" className="w-full h-full">
            <line x1="30" y1="140" x2="290" y2="140" stroke="#333" strokeWidth="1"/>
            <line x1="30" y1="140" x2="30" y2="10" stroke="#333" strokeWidth="1"/>
            <line x1="30" y1="140" x2="260" y2="30" stroke="#333" strokeWidth="1" strokeDasharray="4,4"/>
            <line x1="30" y1="140" x2="290" y2="140" stroke="#f87171" strokeWidth="2"/>
            <polygon points="290,135 300,140 290,145" fill="#f87171"/>
            <text x="295" y="155" fill="#f87171" fontSize="14" fontWeight="bold">X</text>
            <line x1="30" y1="140" x2="30" y2="10" stroke="#60a5fa" strokeWidth="2"/>
            <polygon points="25,10 30,0 35,10" fill="#60a5fa"/>
            <text x="10" y="5" fill="#60a5fa" fontSize="14" fontWeight="bold">Y</text>
            <line x1="30" y1="140" x2="260" y2="30" stroke="#4ade80" strokeWidth="2"/>
            <polygon points="255,25 260,20 265,30" fill="#4ade80"/>
            <text x="268" y="25" fill="#4ade80" fontSize="14" fontWeight="bold">Z</text>
            <circle cx="30" cy="140" r="4" fill="#c9a84c"/>
            <circle cx="100" cy="100" r="3" fill="#f8717122" className="animate-axis-pulse"/>
            <circle cx="180" cy="90" r="3" fill="#60a5fa22" className="animate-axis-pulse" style={{animationDelay: '1s'}}/>
            <circle cx="220" cy="50" r="3" fill="#4ade8022" className="animate-axis-pulse" style={{animationDelay: '2s'}}/>
          </svg>
        </div>

        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          Sealed Cases
        </h3>
        <div className="flex-1 overflow-y-auto space-y-3">
          {CASES.map(c => (
            <div
              key={c.id}
              className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-vault-gold/30 transition-colors cursor-default"
            >
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{c.title}</p>
              <span className="text-xs text-vault-gold mt-1 inline-block">{c.tag}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-300 dark:text-gray-600 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          SealBox — Your digital safe. Nothing leaves until it's time.
        </p>
      </div>
    </div>
  )
}
