import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom', 
    globals: true,         
    setupFiles: ['src/test/setupTests.ts'],
    coverage: {
      reporter: ['text', 'lcov'], 
      reportsDirectory: 'coverage', 
      include: [
        'src/components/**/*.{ts,tsx}',
        'src/pages/**/*.{ts,tsx}',
        'src/services/**/*.{ts,tsx}',
        'src/lib/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/main.tsx',
        'src/App.tsx',
        'src/test/**/*',
        'src/routes/**/*',
        'src/types/**/*',
        'src/constants/**/*',
        'src/**/*.d.ts',
        'src/components/Header',
        'src/components/IdeiaCard/IdeaHistoryCard.tsx',
        'src/components/StatsCard/StatsKPI.tsx',
        'src/components/Footer/AppFooter.tsx',
        'src/lib',
      ],
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'], 
    exclude: ['node_modules', 'dist'],
  },
})
