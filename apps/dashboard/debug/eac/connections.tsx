import { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { OpenBiotechWebState } from '@o-biotech/common/state';

export const handler: EaCRuntimeHandlerSet<OpenBiotechWebState> = {
  async GET(_req, ctx) {
    const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT!);

    const connections = await eacSvc.EaC.Connections(ctx.State.EaC!);

    return Response.json(connections);
  },
};
