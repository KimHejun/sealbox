import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../contexts/ThemeContext'

export default function Receive() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()

  const handleSubmit = async () => {
    const cleanCode = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    if (!cleanCode) { setError('Enter a code'); return }
    setLoading(true)
    setError('')

    const { data, error: dbError } = await supabase
      .from('vows')
      .select('id')
      .eq('access_code', cleanCode)
      .single()

    setLoading(false)

    if (dbError || !data) {
      setError('No sealed box found. Double-check the code.')
      return
    }

    navigate(`/view/${cleanCode}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 p-8">
      <button onClick={toggle} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        {dark ? (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
        ) : (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
        )}
      </button>
      <div className="max-w-md w-full text-center">
        <button onClick={() => navigate('/')} className="text-sm text-gray-400 dark:text-gray-500 hover:text-vault-gold mb-8 inline-block">
          ← Back to vault
        </button>

        <h2 className="text-2xl font-bold mb-2 dark:text-white">Enter seal code</h2>
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">Someone shared a code with you.</p>

        <input
          type="text"
          value={code}
          onChange={e => { setCode(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="XXXX-XXXX"
          className="w-full px-5 py-4 text-xl text-center font-mono tracking-widest border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-vault-gold focus:outline-none transition-colors bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          autoFocus
        />

        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-4 py-4 bg-vault-dark text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Open'}
        </button>
      </div>
    </div>
  )
}
