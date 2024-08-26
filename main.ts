import { start } from '@fathym/eac/runtime';
import { config, configure } from './configs/eac-runtime.config.ts';

// const path = Deno.env.get('O_BIOTECH_DENO_KV_PATH') ?? '/home/denoKv/o-biotech.db'
// const info = await Deno.stat(path)

// console.log(`info: ${info}`)
// console.log(`IsFile: ${info.isFile}`)
// console.log(`isDirectory: ${info.isDirectory}`)
// console.log(`Size: ${info.size}`)
// console.log(Deno.env.get('O_BIOTECH_DENO_KV_PATH'))

await start(await config, configure);
