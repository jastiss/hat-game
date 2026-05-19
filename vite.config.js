import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// При деплое на GitHub/GitLab Pages сайт публикуется по пути /<repo-name>/.
// На GitHub Actions выставляется GITHUB_REPOSITORY в виде "user/repo".
// На GitLab CI выставляется CI_PROJECT_NAME в виде "repo".
// Локально обе переменные пустые → base = '/' — всё работает.
let repoName = process.env.CI_PROJECT_NAME
if (!repoName && process.env.GITHUB_REPOSITORY) {
  repoName = process.env.GITHUB_REPOSITORY.split('/')[1]
}
const base = repoName ? `/${repoName}/` : '/'

export default defineConfig({
  plugins: [react()],
  base,
  build: {
    outDir: 'dist'
  }
})
