import { EaCRuntimeHandler } from '@fathym/eac/runtime/pipelines';
import { buildCurrentEaCMiddleware } from '@fathym/eac-applications/steward/api';
import { establishOpenBiotechWebStateMiddleware } from '@o-biotech/common/utils';

export default [
  buildCurrentEaCMiddleware("o-biotech"),
  establishOpenBiotechWebStateMiddleware(),
] as EaCRuntimeHandler[];
