import { EaCRuntimeHandler } from '@fathym/eac/runtime';
import { establishOpenBiotechWebStateMiddleware } from '../../../src/middleware/establishOpenBiotechWebStateMiddleware.ts';

export default [
  establishOpenBiotechWebStateMiddleware(),
] as EaCRuntimeHandler[];
