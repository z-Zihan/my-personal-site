import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../utils/api'
import useAuthStore from '../../store/authStore'

function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data } = await authApi.login({ username, password })
      login(data.data.token, data.data.user)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark via-dark to-secondary/20">
      <div className="w-full max-w-md">
        <div className="glass p-8 rounded-2xl neon-border">
          <h1 className="text-3xl font-bold text-center mb-8 neon-text">
            后台管理
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent border border-gray-700 rounded-lg p-3 focus:border-primary focus:outline-none"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-gray-700 rounded-lg p-3 focus:border-primary focus:outline-none"
                placeholder="••••••"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-dark font-bold rounded-lg disabled:opacity-50 hover:bg-secondary hover:text-white transition-all"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>默认账号：admin / admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
