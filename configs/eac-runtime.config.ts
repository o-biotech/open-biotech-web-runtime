import { EaCRuntime } from '@fathym/eac/runtime';
import { defineEaCApplicationsConfig } from '@fathym/eac-applications/runtime';
import OpenBiotechWebPlugin from '../src/plugins/OpenBiotechWebPlugin.ts';
import { RuntimeLoggingProvider } from '../src/logging/RuntimeLoggingProvider.ts';
import { EaCRuntimeHandlerRouteGroup } from '@fathym/eac/runtime/pipelines';

export const config = defineEaCApplicationsConfig(
  {
    Plugins: [new OpenBiotechWebPlugin()],
  },
  new RuntimeLoggingProvider(),
);

export function configure(
  _rt: EaCRuntime,
): Promise<EaCRuntimeHandlerRouteGroup[] | undefined> {
  return Promise.resolve([]);
}
