/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Importe o 'path' do Node

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    }
  },

  server: {
    host: '0.0.0.0',  // Permite acesso de qualquer dispositivo na mesma rede local
    port: 3000,        // Ou qualquer outra porta que você queira usar
    strictPort: true,  // Garantir que a porta esteja disponível
  }
})
