// 全局 Toast 通知系统

let toastContainer = null

// 初始化 Toast 容器
const initContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.className = 'fixed top-4 right-4 z-[9999] space-y-2'
    document.body.appendChild(toastContainer)
  }
}

// 创建 Toast 元素
const createToast = (message, type = 'info', duration = 3000) => {
  initContainer()
  
  const toast = document.createElement('div')
  toast.className = `
    px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300
    flex items-center gap-2 min-w-[200px] max-w-md
    ${type === 'success' ? 'bg-green-500 text-white' : ''}
    ${type === 'error' ? 'bg-red-500 text-white' : ''}
    ${type === 'warning' ? 'bg-yellow-500 text-white' : ''}
    ${type === 'info' ? 'bg-blue-500 text-white' : ''}
  `
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }
  
  toast.innerHTML = `
    <span>${icons[type] || icons.info}</span>
    <span>${message}</span>
  `
  
  toastContainer.appendChild(toast)
  
  // 动画进入
  requestAnimationFrame(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateX(0)'
  })
  
  // 自动移除
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(100%)'
    setTimeout(() => {
      toastContainer?.removeChild(toast)
      if (toastContainer?.children.length === 0) {
        document.body.removeChild(toastContainer)
        toastContainer = null
      }
    }, 300)
  }, duration)
}

// Toast API
export const toast = {
  success: (message, duration) => createToast(message, 'success', duration),
  error: (message, duration) => createToast(message, 'error', duration),
  warning: (message, duration) => createToast(message, 'warning', duration),
  info: (message, duration) => createToast(message, 'info', duration),
}

export default toast
