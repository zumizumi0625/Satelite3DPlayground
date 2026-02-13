import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { Cesium3DTile } from 'cesium'
import cesium from 'vite-plugin-cesium'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cesium()
  ],
})
