import { redirectRequest } from '@fathym/common';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime';
import { OpenBiotechWebState } from '../../../../src/state/OpenBiotechWebState.ts';

export const handler: EaCRuntimeHandlers<OpenBiotechWebState> = {
  async POST(req, ctx) {
    const formData = await req.formData();

    const explored = !!(formData.get('explored') as string);

    const entLookup = ctx.State.EaC!.EnterpriseLookup!;

    await ctx.State.OBiotechKV.set(
      ['EaC', entLookup, 'Current', 'Explored'],
      explored,
    );

    return redirectRequest('/dashboard/getting-started/data', false, false);
  },
};
