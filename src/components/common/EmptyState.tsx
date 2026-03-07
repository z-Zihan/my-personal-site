import React, { CSSProperties } from 'react'

interface EmptyStateProps {
  description?: string
  subDescription?: string
  icon?: 'default' | 'article' | 'message' | 'data' | 'chart'
  padding?: number
}

const icons: Record<string, React.ReactNode> = {
  default: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  ),
  article: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  ),
  message: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
    />
  ),
  data: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  ),
  chart: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
    />
  ),
}

/**
 * 自定义空状态组件 - 替换 antd Empty
 * @param description - 描述文字
 * @param subDescription - 副描述文字
 * @param icon - 图标类型 (default, article, message, data, chart)
 * @param padding - 内边距
 */
export default function EmptyState({
  description = '暂无数据',
  subDescription = '',
  icon = 'default',
  padding = 40,
}: EmptyStateProps) {
  return (
    <div
      style={{
        padding,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderRadius: '12px',
        position: 'relative' as CSSProperties['position'],
        overflow: 'hidden',
      }}
    >
      {/* 背景光晕 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '200px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'pulse 3s ease-in-out infinite',
        }}
      />

      {/* SVG 图标 */}
      <svg
        className="w-24 h-24 text-gray-400 relative z-10 mx-auto mb-4"
        style={{ width: '80px', height: '80px', position: 'relative', zIndex: 10 }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {icons[icon] || icons.default}
      </svg>

      {/* 浮动装饰点 */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '25%',
          width: '8px',
          height: '8px',
          background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
          borderRadius: '50%',
          animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '25%',
          left: '28%',
          width: '6px',
          height: '6px',
          background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
          borderRadius: '50%',
          animation: 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
          animationDelay: '0.5s',
        }}
      />

      {/* 描述文字 */}
      <h3
        style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#6b7280',
          marginBottom: '8px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {description}
      </h3>
      {subDescription && (
        <p
          style={{
            fontSize: '14px',
            color: '#9ca3af',
            maxWidth: '400px',
            margin: '0 auto',
            lineHeight: '1.6',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {subDescription}
        </p>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
