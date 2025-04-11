import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import react from '@astrojs/react';

export default defineConfig({
  integrations: [tailwind(), react()],
  server: {
    port: 8000
  },
  outDir: "public_html",
  // Garantir que os arquivos estáticos sejam copiados para o diretório de saída
  publicDir: "public"
});