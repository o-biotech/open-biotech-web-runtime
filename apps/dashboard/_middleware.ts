import { EaCRuntimeHandler } from '@fathym/eac/runtime';
import { establishOpenBiotechWebStateMiddleware } from '../../src/middleware/establishOpenBiotechWebStateMiddleware.ts';
import { establishCurrentEaCMiddleware } from '../../src/middleware/establishCurrentEaCMiddleware.ts';

export default [
  establishOpenBiotechWebStateMiddleware(),
] as EaCRuntimeHandler[];
