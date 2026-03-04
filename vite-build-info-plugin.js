import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

export default function buildInfoPlugin() {
  return {
    name: 'vite-build-info-plugin',
    closeBundle: async () => {
      const now = new Date()
      const buildTime = now.toISOString().replace('T', ' ').substring(0, 19)

      let commitHash = 'unknown'
      let branch = 'unknown'
      try {
        commitHash = execSync('git rev-parse --short HEAD').toString().trim()
        branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
      } catch (e) {
        console.log('Not a git repository, using default values')
      }

      const nodeVersion = process.version

      // 构建信息注释
      const comment = `<!--
================================================================================
  Zihan's Blog - Build Information
================================================================================
  Build Time:    ${buildTime}
  Branch:        ${branch}
  Commit:        ${commitHash}
  Node Version:  ${nodeVersion}
================================================================================
-->
`

      // 读取 dist/index.html 并在开头添加注释
      const distPath = path.resolve('dist', 'index.html')
      const content = fs.readFileSync(distPath, 'utf-8')
      fs.writeFileSync(distPath, comment + content, 'utf-8')

      console.log('Build info injected into index.html')
    }
  }
}
