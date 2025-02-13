import { EaCRuntimeHandler } from '@fathym/eac/runtime/pipelines';
import { establishOpenBiotechWebStateMiddleware } from '@o-biotech/common/utils';

export default [
  establishOpenBiotechWebStateMiddleware(),
] as EaCRuntimeHandler[];
