// requireAdmin — the single admin-auth gate (v2 HMAC tokens)
// Replaces the 16 endpoint-local validateToken copies (2026-11-16 deploy).
//
// Design notes:
// - The signing key is derived from ADMIN_PASSWORD (SHA-256 with a domain separator)
//   instead of a dedicated ADMIN_TOKEN_SECRET env var: the credential already exists in
//   Vercel, so the fix deploys with zero new env vars. Cost: rotating the password also
//   rotates the token key (all sessions die — acceptable for a single-admin blog).
// - Old `admin_<ts>_<hex>` tokens have no signature; verify rejects any non-v2 format,
//   so deploying this invalidates every outstanding old token (owners re-login once).

import { errorResponse, optionsResponse } from './_lib'

const TOKEN_DOMAIN_SEP = '::token-signing-v1'

function b64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
}

async function deriveTokenKey(password: string): Promise<CryptoKey> {
  const material = new TextEncoder().encode(password + TOKEN_DOMAIN_SEP)
  const digest = await crypto.subtle.digest('SHA-256', material)
  return crypto.subtle.importKey('raw', digest, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

/** Issue a signed v2 token. Returns null when ADMIN_PASSWORD is not configured (fail closed). */
export async function createAdminToken(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return null
  const key = await deriveTokenKey(password)
  const payload = JSON.stringify({ sub: 'admin', exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return `v2.${b64urlEncode(new TextEncoder().encode(payload))}.${b64urlEncode(sig)}`
}

/** Verify a v2 token. Rejects anything that is not exactly a well-formed, unexpired, correctly-signed token. */
export async function verifyAdminToken(token: string | null | undefined): Promise<boolean> {
  try {
    if (typeof token !== 'string' || !token.startsWith('v2.')) return false
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const payloadJson = new TextDecoder().decode(b64urlDecode(parts[1]))
    const payload = JSON.parse(payloadJson) as { sub?: string; exp?: number }
    if (payload.sub !== 'admin') return false
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return false
    const password = process.env.ADMIN_PASSWORD
    if (!password) return false
    const key = await deriveTokenKey(password)
    return await crypto.subtle.verify('HMAC', key, b64urlDecode(parts[2]), new TextEncoder().encode(payloadJson))
  } catch {
    return false
  }
}

/**
 * Wrap an admin handler with Bearer-token verification.
 * Usage: export default requireAdmin(async (req) => { ... })
 * All non-OPTIONS requests without a valid v2 token get 401 before the handler runs.
 */
export function requireAdmin(handler: (req: Request) => Promise<Response>) {
  return async function (req: Request): Promise<Response> {
    if (req.method === 'OPTIONS') {
      return optionsResponse()
    }
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Unauthorized', 401)
    }
    const token = authHeader.substring(7)
    const valid = await verifyAdminToken(token)
    if (!valid) {
      return errorResponse('Invalid or expired token', 401)
    }
    return handler(req)
  }
}
