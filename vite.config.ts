import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import remarkToc from 'remark-toc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import { readFileSync } from 'fs'

// Read package.json to get version
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        mdx({
            remarkPlugins: [remarkGfm, remarkToc],
            rehypePlugins: [rehypeHighlight, rehypeSlug]
        })
    ],

    // Define global constants
    define: {
        __APP_VERSION__: JSON.stringify(packageJson.version),
        __APP_NAME__: JSON.stringify(packageJson.name)
    },

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
        port: 1420,
        strictPort: true,
        hmr: {
            port: 1421,
            overlay: false // Disable error overlay to prevent reconnection messages
        },
        watch: {
            // 3. tell vite to ignore watching `src-tauri`
            ignored: ['**/src-tauri/**']
        }
    },

    // Shadcn UI
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
})
