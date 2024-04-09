import { respond } from '@fathym/common';
import { loadEaCSvc } from '@fathym/eac/api';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime';
import { OpenBiotechWebState } from '../../../src/state/OpenBiotechWebState.ts';
import { OpenBiotechEaC } from '../../../src/eac/OpenBiotechEaC.ts';

export const handler: EaCRuntimeHandlers<OpenBiotechWebState> = {
  async GET(_req, ctx) {
    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const eacConnections = await eacSvc.Connections<OpenBiotechEaC>(
      ctx.State.EaC!,
    );

    return respond(eacConnections);
  },

  async POST(req, ctx) {
    const eac: OpenBiotechEaC = await req.json();

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const eacConnections = await eacSvc.Connections<OpenBiotechEaC>(
      eac || ctx.State.EaC!,
    );

    return respond(eacConnections);
  },
};
