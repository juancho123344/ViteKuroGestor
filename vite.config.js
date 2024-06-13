import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Directorio de salida de la construcción
    emptyOutDir: true, // Limpiar directorio de salida antes de construir
    sourcemap: true, // Habilitar sourcemaps para depuración
  },
});
