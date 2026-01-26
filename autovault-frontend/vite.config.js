import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../autovault-backend/certs/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../autovault-backend/certs/cert.pem'))
    },
    port: 5173,
    host: true
  }
})
