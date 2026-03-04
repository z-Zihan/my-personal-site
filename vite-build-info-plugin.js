import { execSync } from 'child_process'

export default function buildInfoPlugin() {
  return {
    name: 'vite-build-info-plugin',
    config: () => {
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

      return {
        define: {
          __BUILD_INFO__: JSON.stringify({
            buildTime,
            commitHash,
            branch,
            nodeVersion: process.version,
          })
        }
      }
    }
  }
}
