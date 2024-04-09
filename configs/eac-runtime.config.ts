import { DefaultEaCConfig, defineEaCConfig, EaCRuntime } from '@fathym/eac/runtime';
import OpenBiotechWebPlugin from '../src/plugins/OpenBiotechWebPlugin.ts';

export const config = defineEaCConfig({
  Plugins: [...(DefaultEaCConfig.Plugins || []), new OpenBiotechWebPlugin()],
});

export function configure(_rt: EaCRuntime): Promise<void> {
  return Promise.resolve();
}
