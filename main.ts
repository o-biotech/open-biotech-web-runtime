import { start } from '@fathym/eac/runtime';
import { config, configure } from './configs/eac-runtime.config.ts';

// const info = await Deno.stat(Deno.env.get('O_BIOTECH_DENO_KV_PATH') ?? '/home/denokv/o-biotech.db')

// console.log(`IsFile: ${info.isFile}`)
// console.log(`isDirectory: ${info.isDirectory}`)
// console.log(`Size: ${info.size}`)
console.log(Deno.env.get('O_BIOTECH_DENO_KV_PATH'))

await start(await config, configure);
