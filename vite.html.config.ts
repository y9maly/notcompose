import { defineConfig } from 'vite'

export default defineConfig({
    root: 'src/html-examples',
    resolve: {
        tsconfigPaths: true,
    },
    server: {
        port: 5173,
    },
    preview: {
        port: 4173,
    },
    build: {
        outDir: '../../dist-html-examples',
        emptyOutDir: true,
    },
})
