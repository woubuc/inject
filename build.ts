import { rm } from "node:fs/promises";

await rm('./dist', { recursive: true, force: true });

await Bun.build({
    entrypoints: ['./src/lib.ts'],
    outdir: './dist',
    target: 'node',
    format: 'esm',
});

console.log('build completed.');
