import vue from '@vitejs/plugin-vue'
import ssr from 'vite-plugin-ssr/plugin'
import { UserConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

const config: UserConfig = {
  plugins: [vue(), ssr(),  mkcert()],
  server: { https: true },
}

export default config
