import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs'],
    target: 'es2023',
    dts: true,
    outDir: 'dist',
    sourcemap: true,
    tsconfig: './tsconfig.json'
})