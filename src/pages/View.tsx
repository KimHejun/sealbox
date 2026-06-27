import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, hashPassword, decryptContent } from '../lib/supabase'
import { useTheme } from '../contexts/ThemeContext'

export default function View() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [vow, setVow] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [decryptedContent, setDecryptedContent] = useState('')
  const [expiryMessage, setExpiryMessage] = useState('')
  const { dark, toggle } = useTheme()

  useEffect(() => {
    if (!code) { navigate('/'); return }

    supabase.from('vows').select('*').eq('access_code', code).single().then(({ data, error: dbErr }) => {
      setLoading(false)
      if (dbErr || !data) {
        setError('Sealed box not found')
        return
      }
      setVow(data)

      if (data.status === 'locked') {
        setError('This box has been locked. It was already opened.')
        return
      }
      if (data.status === 'destroyed') {
        setError('This box no longer exists.')
        return
      }
      if (data.unlock_at && new Date(data.unlock_at) > new Date()) {
        const unlockDate = new Date(data.unlock_at).toLocaleString()
        setError(`This box is time-locked until ${unlockDate}`)
        return
      }
    })
  }, [code, navigate])

  useEffect(() => {
    if (!revealed || !vow) return
    const dur = vow.read_duration
    if (!dur || dur <= 0) return

    const remaining = Math.max(0, Math.floor(dur / 1000))
    if (remaining <= 0) return

    setExpiryMessage(`This message will self-destruct in ${Math.floor(remaining / 60)}m ${remaining % 60}s`)

    const interval = setInterval(() => {
      setExpiryMessage(prev => {
        if (!prev) return prev
        const match = prev.match(/(\d+)m (\d+)s/)
        if (!match) return prev
        let m = parseInt(match[1]), s = parseInt(match[2])
        if (s > 0) s--
        else if (m > 0) { m--; s = 59 }
        else {
          setRevealed(false)
          setExpiryMessage('Message destroyed.')
          supabase.from('vows').update({ status: 'destroyed' }).eq('id', vow.id)
          return 'Message destroyed.'
        }
        return `This message will self-destruct in ${m}m ${s}s`
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [revealed, vow])

  const handleUnlock = async () => {
    if (!password.trim()) { setError('Enter the password'); return }
    setUnlocking(true)
    setError('')

    const inputHash = hashPassword(password.trim())
    if (inputHash !== vow.password_hash) {
      setError('Wrong password')
      setUnlocking(false)
      return
    }

    try {
      const decrypted = await decryptContent(vow.content, password.trim())
      setDecryptedContent(decrypted)
    } catch {
      setError('Decryption failed. The content may be corrupted.')
      setUnlocking(false)
      return
    }

    setRevealed(true)
    setUnlocking(false)

    if (vow.status === 'sealed') {
      await supabase.from('vows').update({ status: 'locked', locked_at: new Date().toISOString() }).eq('id', vow.id)
      await supabase.from('view_logs').insert({ vow_id: vow.id })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-vault-gold border-t-transparent rounded-full animate-spin"/>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-8">
      <button onClick={toggle} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        {dark ? (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
        ) : (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
        )}
      </button>
      <div className="max-w-lg w-full">
        <button onClick={() => navigate('/')} className="text-sm text-gray-400 dark:text-gray-500 hover:text-vault-gold mb-8 inline-block">
          ← Back to vault
        </button>

        {error && !revealed && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 bg-vault-dark text-white rounded-xl font-medium">
              Back to vault
            </button>
          </div>
        )}

        {!revealed && !error && vow && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-vault-dark flex items-center justify-center">
              <svg className="w-10 h-10 text-vault-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 dark:text-white">Enter password</h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">The sender locked this with a password.</p>

            <input
              type="text"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              placeholder="Password..."
              className="w-full px-5 py-4 text-center border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-vault-gold focus:outline-none transition-colors bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              autoFocus
            />

            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

            <button
              onClick={handleUnlock}
              disabled={unlocking}
              className="w-full mt-4 py-4 bg-vault-dark text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50"
            >
              {unlocking ? 'Unlocking...' : 'Unlock'}
            </button>
          </div>
        )}

        {revealed && vow && (
          <div className="animate-fade-in">
            {expiryMessage && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm px-4 py-2 rounded-lg mb-4 text-center">
                {expiryMessage}
              </div>
            )}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-vault-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-xs text-vault-gold font-medium tracking-wide uppercase">End-to-end encrypted</span>
              </div>
              <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-lg">
                {decryptedContent}
              </div>
            </div>
            <p className="text-xs text-gray-300 dark:text-gray-600 text-center mt-4">
              SealBox — eXact words. Yours alone. Zero compromise.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
