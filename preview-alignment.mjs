import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile, writeFile } from 'node:fs/promises';
await build({configFile:false,plugins:[react()],define:{'process.env.NODE_ENV':'"production"'},build:{outDir:'.preview-alignment',lib:{entry:'preview-alignment.jsx',name:'Preview',formats:['iife'],fileName:()=> 'preview.js'},emptyOutDir:false}});
const css=await readFile('src/styles.css','utf8');
await writeFile('previa-alinhamento.html',`<!doctype html><meta charset="utf-8"><style>${css}\n.arrival,.piece.vez,.piece.chegando,.blades{animation:none}.piece{transition:none}</style><div id="root"></div><script src="./.preview-alignment/preview.js"></script>`);
