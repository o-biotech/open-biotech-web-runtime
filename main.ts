import { start } from '@fathym/eac/runtime';
import { config, configure } from './configs/eac-runtime.config.ts';

Deno.stat(Deno.env.get('O_BIOTECH_DENO_KV_PATH') ?? '/home/denokv/o-biotech.db')

console.log(Deno.env.get('O_BIOTECH_DENO_KV_PATH'))

await start(await config, configure);
