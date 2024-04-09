import { redirectRequest, respond } from '@fathym/common';
import { loadEaCSvc, UserEaCRecord } from '@fathym/eac/api';
import { EaCRuntimeHandlerResult } from '@fathym/eac/runtime';
import { OpenBiotechWebState } from '../../../src/state/OpenBiotechWebState.ts';

export const handler: EaCRuntimeHandlerResult<OpenBiotechWebState> = {
  GET(_req, ctx) {
    return respond(ctx.State.EaC || {});
  },

  async POST(req, ctx) {
    const formData = await req.formData();

    const username = formData.get('username') as string;

    const isOwner = !!formData.get('isOwner');

    // const parentEaCSvc = await loadEaCSvc();

    // const jwt = await parentEaCSvc.JWT(
    //   ctx.state.EaC!.EnterpriseLookup,
    //   username
    // );

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const inviteResp = await eacSvc.InviteUser(
      ctx.State.EaC!.EnterpriseLookup!,
      {
        Owner: isOwner,
        Username: username,
      } as UserEaCRecord,
    );

    console.log(inviteResp);

    return redirectRequest('/dashboard/teams', false, false);
  },
};
