import { EaCRuntimeHandler } from '@fathym/eac/runtime';
import { establishOpenBiotechWebStateMiddleware } from '../../../src/eac/establishOpenBiotechWebStateMiddleware.ts';

export default [
  establishOpenBiotechWebStateMiddleware(),
] as EaCRuntimeHandler[];
