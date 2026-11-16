import { jsonResponse, errorResponse, optionsResponse } from './_lib'
import { verifyAdminToken } from './_auth'
import type { TokenVerifyResponse } from '../src/types/database'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const body = await req.json() as { token: string }
    const { token } = body

    if (!token) {
      return jsonResponse<TokenVerifyResponse>({ valid: false })
    }

    // v2 HMAC 签名校验（2026-11-16）：无签名或签名不符一律 valid:false
    const valid = await verifyAdminToken(token)
    return jsonResponse<TokenVerifyResponse>({ valid })
  } catch (error) {
    console.error('Error verifying token:', error)
    return errorResponse('Internal server error', 500)
  }
}
