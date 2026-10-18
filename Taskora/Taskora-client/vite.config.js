import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'


let tailwindPlugin = null
try {
  const { default: tailwindcss } = await import('@tailwindcss/vite')
  tailwindPlugin = tailwindcss()
} catch {

}


export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    ...(tailwindPlugin ? [tailwindPlugin] : []),
  ],
})
