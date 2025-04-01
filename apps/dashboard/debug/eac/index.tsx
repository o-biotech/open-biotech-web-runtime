import { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { OpenBiotechWebState } from '@o-biotech/common/state';

export const handler: EaCRuntimeHandlerSet<OpenBiotechWebState> = {
  GET(_req, ctx) {
    return Response.json(ctx.State.EaC);
  },
};
