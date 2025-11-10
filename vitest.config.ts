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
    environment: 'jsdom', // Necessário para testar componentes React
    globals: true,         // Permite usar describe/it/expect sem importar
    setupFiles: ['src/test/setupTests.ts'],
    coverage: {
      reporter: ['text', 'lcov'], // "lcov" é o formato que o Sonar lê
      reportsDirectory: 'coverage', // cria coverage/lcov.info
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'], // onde estão seus testes
    exclude: ['node_modules', 'dist'],
  },
})
