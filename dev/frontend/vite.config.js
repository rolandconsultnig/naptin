import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Load SSL certificates for HTTPS
const sslCert = path.resolve(__dirname, '../ssl/cert.pem')
const sslKey = path.resolve(__dirname, '../ssl/key.pem')

const httpsConfig = fs.existsSync(sslCert) && fs.existsSync(sslKey) ? {
  key: fs.readFileSync(sslKey),
  cert: fs.readFileSync(sslCert)
} : false

export default defineConfig({
  plugins: [react()],
  server: {
    port: 6677,
    strictPort: true,
    host: true,
    https: httpsConfig
  }
})
