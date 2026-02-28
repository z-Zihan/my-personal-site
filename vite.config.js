import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// 获取版本号
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
const version = pkg.version

// 构建时间
const buildTime = new Date().toLocaleString('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
}).replace(/\//g, '-')

// 环境
const nodeEnv = process.env.NODE_ENV || 'production'

// Banner 注释
const bannerComment = `<!-- ${buildTime}｜环境：${nodeEnv} | 版本：${version} -->`

console.log(`\n📦 Building version: ${version}`)
console.log(`🕐 Build time: ${buildTime}`)
console.log(`🌍 Environment: ${nodeEnv}\n`)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'banner-plugin',
      transformIndexHtml(html) {
        return html.replace('<html lang="en">', `<html lang="en">\n  ${bannerComment}`)
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        banner: `/* My Personal Site v${version} | ${buildTime} */`,
      },
    },
  },
})
