import { redirectRequest } from '@fathym/common';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime';
import { OpenBiotechWebState } from '../../../../src/state/OpenBiotechWebState.ts';

export const handler: EaCRuntimeHandlers<OpenBiotechWebState> = {
  async POST(req, ctx) {
    const formData = await req.formData();

    const jwt = formData.get('jwt') as string;

    const entLookup = ctx.State.EaC!.EnterpriseLookup!;

    const username = ctx.State.Username;

    await ctx.State.OBiotechKV.set(['User', username, 'EaC', entLookup, 'JWT'], jwt);

    return redirectRequest('/dashboard/getting-started/devices', false, false);
  },
};
