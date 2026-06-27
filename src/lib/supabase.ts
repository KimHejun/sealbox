import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://veplqvgqycydtifwdaea.supabase.co'
const supabaseKey = 'sb_publishable_ShTZONWTNK0yJKFvXbzAHQ_RWNqV06o'

export const supabase = createClient(supabaseUrl, supabaseKey)

// --- Password verification hash (simple, for DB lookup only) ---
export function hashPassword(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

// --- End-to-End Encryption (Web Crypto API, AES-256-GCM) ---

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 600000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptContent(plaintext: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt)
  const encoder = new TextEncoder()

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  )

  // Pack: salt(16) + iv(12) + ciphertext
  const packed = new Uint8Array(16 + 12 + ciphertext.byteLength)
  packed.set(salt, 0)
  packed.set(iv, 16)
  packed.set(new Uint8Array(ciphertext), 28)

  return btoa(String.fromCharCode(...packed))
}

export async function decryptContent(encryptedBase64: string, password: string): Promise<string> {
  const packed = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0))
  const salt = packed.slice(0, 16)
  const iv = packed.slice(16, 28)
  const ciphertext = packed.slice(28)

  const key = await deriveKey(password, salt)
  const decoder = new TextDecoder()

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )

  return decoder.decode(plaintext)
}
