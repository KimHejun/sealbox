import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, hashPassword, encryptContent } from '../lib/supabase'
import { useTheme } from '../contexts/ThemeContext'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function formatCode(code: string): string {
  return code.match(/.{1,4}/g)?.join('-') || code
}

export default function Write() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [content, setContent] = useState('')
  const [password, setPassword] = useState('')
  const [unlockAt, setUnlockAt] = useState('')
  const [readDuration, setReadDuration] = useState('300')
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const { dark, toggle } = useTheme()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
  }, [])

  const handleSignUp = async () => {
    const email = prompt('Enter your email:')
    if (!email) return
    const password = prompt('Create a password (6+ chars):')
    if (!password) return
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else {
      alert('Check your email to confirm. Then come back and sign in.')
      supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    }
  }

  const handleSignIn = async () => {
    const email = prompt('Enter your email:')
    if (!email) return
    const password = prompt('Enter your password:')
    if (!password) return
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else {
      supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    }
  }

  const handleSeal = async () => {
    if (!content.trim()) { setError('Write something first'); return }
    if (!password.trim()) { setError('Set a password to lock it'); return }
    setLoading(true)
    setError('')

    const newCode = generateCode()
    const encryptedContent = await encryptContent(content.trim(), password.trim())
    const { error: insertError } = await supabase.from('vows').insert({
      sender_id: user?.id ?? null,
      content: encryptedContent,
      password_hash: hashPassword(password.trim()),
      access_code: newCode,
      status: 'sealed',
      read_duration: parseInt(readDuration),
      unlock_at: unlockAt || null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setCode(newCode)
    setLoading(false)
  }

  if (code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 p-8">
        {/* Theme Toggle */}
        <button onClick={toggle} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          {dark ? (
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
          )}
        </button>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-vault-dark flex items-center justify-center">
            <svg className="w-10 h-10 text-vault-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Sealed.</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Share this code with the recipient:</p>
          <div className="text-4xl font-mono font-bold tracking-widest text-vault-gold mb-2">
            {formatCode(code)}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">They'll need the password to open it.</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-vault-dark text-white rounded-xl font-medium hover:opacity-90"
          >
            Back to vault
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      {/* Theme Toggle */}
      <button onClick={toggle} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        {dark ? (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
        ) : (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
        )}
      </button>

      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate('/')} className="text-sm text-gray-400 dark:text-gray-500 hover:text-vault-gold mb-6 inline-block">
          ← Back to vault
        </button>

        <h1 className="text-3xl font-bold mb-8 dark:text-white">Seal something</h1>

        {!user ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-6">Sign in to seal your words.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleSignIn} className="px-6 py-3 bg-vault-dark text-white rounded-xl font-medium">
                Sign In
              </button>
              <button onClick={handleSignUp} className="px-6 py-3 border-2 border-gray-200 dark:border-gray-700 dark:text-gray-300 rounded-xl font-medium">
                Sign Up
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">What do you want to seal?</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write anything — a message, a promise, evidence, a will..."
                className="w-full h-40 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-vault-gold focus:outline-none resize-none bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                maxLength={10000}
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{content.length}/10,000 characters</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-vault-gold">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                End-to-end encrypted — we can't read your content
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lock it with a password</label>
              <input
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="4-8 characters, share with recipient"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-vault-gold focus:outline-none bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                maxLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unlock timing (optional)</label>
              <input
                type="datetime-local"
                value={unlockAt}
                onChange={e => setUnlockAt(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-vault-gold focus:outline-none bg-white dark:bg-gray-800 dark:text-white [color-scheme:light_dark]"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Leave empty to allow immediate access with code + password</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reading window (once opened)</label>
              <select
                value={readDuration}
                onChange={e => setReadDuration(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-vault-gold focus:outline-none bg-white dark:bg-gray-800 dark:text-white"
              >
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
                <option value="600">10 minutes</option>
                <option value="1800">30 minutes</option>
                <option value="3600">1 hour</option>
                <option value="0">Unlimited</option>
              </select>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleSeal}
              disabled={loading}
              className="w-full py-4 bg-vault-dark text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Sealing...' : 'Seal it'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
