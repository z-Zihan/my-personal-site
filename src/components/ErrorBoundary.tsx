import React, { Component, ReactNode } from 'react'
import { useNavigate, useRouteError } from 'react-router-dom'
import { RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: ReactNode
}

// 错误边界组件 - 捕获子组件的错误
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 错误信息会显示在 UI 上
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={() => {
            this.setState({ hasError: false, error: null, errorInfo: null })
            window.location.reload()
          }}
        />
      )
    }

    return this.props.children
  }
}

// 路由错误处理器（用于 useRouteError）
export function RouteErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()

  return (
    <ErrorFallback
      error={error as Error}
      resetErrorBoundary={() => {
        window.location.href = '/'
      }}
      goHome={() => navigate('/')}
    />
  )
}

interface ErrorFallbackProps {
  error: Error | null
  resetErrorBoundary: () => void
  goHome?: () => void
}

// 错误显示组件
function ErrorFallback({ error, resetErrorBoundary, goHome }: ErrorFallbackProps) {
  const sendEmail = () => {
    const subject = encodeURIComponent('网站错误报告')
    const body = encodeURIComponent(
      `
错误信息：${error?.message || '未知错误'}
错误类型：${error?.name || 'UnknownError'}
发生时间：${new Date().toLocaleString('zh-CN')}
错误堆栈：${error?.stack || '无'}

请在上方补充您正在进行的操作步骤，以便开发者定位问题。
    `.trim()
    )

    window.location.href = `mailto:admin@example.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
        {/* 错误图标动画 */}
        <div className="relative mb-8">
          {/* 背景光晕 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" />

          {/* SVG 图标 - 错误警告 */}
          <svg className="w-24 h-24 mx-auto text-white relative z-10 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>

          {/* 浮动装饰 */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full animate-ping" />
          <div className="absolute bottom-4 left-4 w-2 h-2 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* 错误标题 */}
        <h1 className="text-4xl font-bold text-white mb-4">出错了！</h1>

        <p className="text-white/90 text-lg mb-6">
          抱歉，页面加载时出现了问题
          <br />
          <span className="text-sm opacity-70">这可能是暂时的网络问题或服务器错误</span>
        </p>

        {/* 错误详情（开发环境显示） */}
        {error?.message && (
          <div className="mb-6 p-4 bg-black/20 rounded-lg text-left">
            <p className="text-white/70 text-sm font-mono break-all">{error.message}</p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="px-8 py-3 bg-white text-red-600 font-semibold rounded-full hover:bg-white/90 transition-colors shadow-lg hover:shadow-xl hover:scale-105 transform duration-200 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5" /> 刷新页面
          </button>
          <button
            onClick={goHome || resetErrorBoundary}
            className="px-8 py-3 bg-white/20 text-white font-semibold rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/30 flex items-center gap-2 mx-auto"
          >
            <Home className="w-5 h-5" /> 返回首页
          </button>
        </div>

        {/* 联系作者 */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-white/70 text-sm mb-4">如果问题持续存在，请联系网站管理员</p>
          <button
            onClick={sendEmail}
            className="px-6 py-2 bg-transparent text-white font-medium rounded-full hover:bg-white/20 transition-colors border border-white/40 flex items-center gap-2 mx-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            发送邮件反馈
          </button>
        </div>

        {/* 自动刷新倒计时 */}
        <AutoRefreshCounter onRefresh={resetErrorBoundary} />
      </div>
    </div>
  )
}

interface AutoRefreshCounterProps {
  onRefresh: () => void
}

// 自动刷新倒计时组件
function AutoRefreshCounter({ onRefresh }: AutoRefreshCounterProps) {
  const [countdown, setCountdown] = React.useState(30)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onRefresh()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onRefresh])

  if (countdown === 0) return null

  return <p className="text-white/50 text-xs mt-6">{countdown} 秒后自动刷新...</p>
}

export default ErrorBoundary
