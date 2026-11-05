import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import buildMetaInjector from 'build-meta-injector'

export default defineConfig({
  plugins: [
    buildMetaInjector({
      // 构建元数据注入（npm: build-meta-injector，替换原本地临时插件）
      timeZone: 'Asia/Shanghai',
      locale: 'zh-CN',
      position: 'after-doctype',
      branch: true,
      fullCommitHash: false,
      customData: { Site: "zZihan's Blog", Deployed: 'Vercel' },
    }),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-512x512.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: "zZihan'sBlog - 张子涵的个人博客",
        short_name: 'ZihanBlog',
        description: '探索技术 · 记录生活 · 分享思考',
        theme_color: '#8b5cf6',
        background_color: '#0f0f0f',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['blog', 'technology', 'lifestyle'],
        lang: 'zh-CN',
        dir: 'ltr'
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024, // 2 MB
        globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}'],
        // 确保新版本 Service Worker 立即激活并清除旧缓存
        skipWaiting: true,
        clientsClaim: true,
        // 不缓存 API 请求
        runtimeCaching: [
          {
            // API 请求始终使用网络（针对线上地址）
            urlPattern: /^https:\/\/zzihanaini\.vercel\.app\/api\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24
              }
            }
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  json: {
    stringify: false,
    namedExports: true
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('antd') || id.includes('@ant-design') || id.includes('rc-')) return 'antd'
            if (id.includes('framer-motion') || id.includes('motion')) return 'motion'
            // 注意：必须在 react 判断之前，否则这些懒加载库会因名字含 'react' 被误抓进 vendor 变成首屏加载
            if (id.includes('wangeditor')) return 'editor'
            if (id.includes('echarts') || id.includes('zrender') || id.includes('d3-geo')) return 'charts'
            if (/micromark|remark|rehype|unified|mdast|hast|unist|vfile|markdown/.test(id)) return 'markdown'
            if (id.includes('react') || id.includes('scheduler')) return 'vendor'
            return undefined // 其余 node_modules 交给 Rollup 默认拆分
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
