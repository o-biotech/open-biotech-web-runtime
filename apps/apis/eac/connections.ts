import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenBiotechWebState } from '@o-biotech/common/state';
import { OpenBiotechEaC } from '@o-biotech/common/utils';

export const handler: EaCRuntimeHandlers<OpenBiotechWebState> = {
  async GET(_req, ctx) {
    const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT!);

    const eacConnections = await eacSvc.EaC.Connections<OpenBiotechEaC>(
      ctx.State.EaC!,
    );

    return Response.json(eacConnections);
  },

  async POST(req, ctx) {
    const eac: OpenBiotechEaC = await req.json();

    const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT!);

    const eacConnections = await eacSvc.EaC.Connections<OpenBiotechEaC>(
      eac || ctx.State.EaC!,
    );

    return Response.json(eacConnections);
  },
};
