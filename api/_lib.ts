import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseKey = process.env.SUPABASE_ANON_KEY as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

// 使用 service role key（绕过 RLS）用于后端 API 操作
// 如果没有配置 service role key，则使用 anon key（但需要确保 RLS 策略允许匿名写入）
const finalKey = supabaseServiceKey || supabaseKey

export const supabase: SupabaseClient = createClient(supabaseUrl, finalKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export interface CorsHeaders {
  'Access-Control-Allow-Origin': string
  'Access-Control-Allow-Headers': string
  'Access-Control-Allow-Methods': string
}

export function corsHeaders(): CorsHeaders {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  }
}

export interface ResponseHeaders extends CorsHeaders {
  'Content-Type': string
}

export function jsonResponse<T = unknown>(data: T, status = 200, headers: Partial<ResponseHeaders> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
      ...headers,
    },
  })
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status)
}

export function optionsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  })
}
