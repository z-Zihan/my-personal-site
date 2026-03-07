import { createClient } from '@supabase/supabase-js'

// eslint-disable-next-line no-undef
const supabaseUrl = process.env.SUPABASE_URL
// eslint-disable-next-line no-undef
const supabaseKey = process.env.SUPABASE_ANON_KEY
// eslint-disable-next-line no-undef
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('[Supabase Client] URL:', supabaseUrl ? 'configured' : 'MISSING')
console.log('[Supabase Client] Anon Key:', supabaseKey ? 'configured' : 'MISSING')
console.log('[Supabase Client] Service Key:', supabaseServiceKey ? 'configured' : 'MISSING')

// 使用 service role key（绕过 RLS）用于后端 API 操作
// 如果没有配置 service role key，则使用 anon key（但需要确保 RLS 策略允许匿名写入）
const finalKey = supabaseServiceKey || supabaseKey

console.log('[Supabase Client] Using key:', supabaseServiceKey ? 'SERVICE_ROLE' : 'ANON')

export const supabase = createClient(supabaseUrl, finalKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  }
}

export function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
      ...headers,
    },
  })
}

export function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status)
}

export function optionsResponse() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  })
}
