import { EaCRuntimeHandler } from '@fathym/eac/runtime/pipelines';
import { establishOpenBiotechWebStateMiddleware } from '@o-biotech/common/utils';
import { buildCurrentEaCMiddleware } from '@fathym/eac-applications/steward/api';

export default [
  buildCurrentEaCMiddleware('o-biotech'),
  establishOpenBiotechWebStateMiddleware(),
] as EaCRuntimeHandler[];
