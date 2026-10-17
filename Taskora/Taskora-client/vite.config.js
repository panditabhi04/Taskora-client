import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// Safely load tailwindcss if installed
let tailwindPlugin = null
try {
  const { default: tailwindcss } = await import('@tailwindcss/vite')
  tailwindPlugin = tailwindcss()
} catch {
  // Available once installed via: npm install
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    ...(tailwindPlugin ? [tailwindPlugin] : []),
  ],
})
