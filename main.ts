import { start } from '@fathym/eac/runtime/server';
import { config, configure } from './configs/eac-runtime.config.ts';

if (typeof globalThis.self === "undefined") {
  // deno-lint-ignore no-explicit-any
  (globalThis as any).self = globalThis;
}

await start(await config, { configure });
