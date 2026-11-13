import { jsonResponse, errorResponse, optionsResponse } from './_lib'

export const config = {
  runtime: 'edge',
}

/**
 * 密码提示接口(公开,无需鉴权)
 * 提示文案本身就是设计为展示在登录页的,不泄露密码本体
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  const hint = process.env.ADMIN_PASSWORD_HINT

  return jsonResponse({
    data: {
      password_hint: hint || null,
    },
  })
}
