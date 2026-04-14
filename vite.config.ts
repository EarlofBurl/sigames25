import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  base: './',
  build: { outDir: '../dist' },
  server: { port: 8080 },
  publicDir: '../public'
})
