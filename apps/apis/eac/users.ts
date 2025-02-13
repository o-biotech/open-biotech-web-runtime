import { redirectRequest } from '@fathym/common';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { OpenBiotechWebState } from '@o-biotech/common/state';
import { EaCUserRecord } from '@fathym/eac';

export const handler: EaCRuntimeHandlerSet<OpenBiotechWebState> = {
  GET(_req, ctx) {
    return Response.json(ctx.State.EaC || {});
  },

  async POST(req, ctx) {
    const formData = await req.formData();

    const username = formData.get('username') as string;

    const isOwner = !!formData.get('isOwner');

    // const parentEaCSvc = await loadEaCStewardSvc();

    // const jwt = await parentEaCSvc.JWT(
    //   ctx.state.EaC!.EnterpriseLookup,
    //   username
    // );

    const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT!);

    const inviteResp = await eacSvc.Users.Invite(
      ctx.State.EaC!.EnterpriseLookup!,
      {
        Owner: isOwner,
        Username: username,
      } as EaCUserRecord,
    );

    console.log(inviteResp);

    return redirectRequest('/dashboard/teams', false, false);
  },
};
