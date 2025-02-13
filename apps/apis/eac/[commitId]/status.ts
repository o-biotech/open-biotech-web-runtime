import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenBiotechWebState } from '@o-biotech/common/state';

export const handler: EaCRuntimeHandlers<OpenBiotechWebState> = {
  async GET(_req, ctx) {
    const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT!);

    const commitId = ctx.Params.commitId!;

    const status = await eacSvc.Status.Get(
      ctx.State.EaC!.EnterpriseLookup!,
      commitId,
    );

    return Response.json(status);
  },
};
