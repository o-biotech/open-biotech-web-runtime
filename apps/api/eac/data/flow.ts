import { redirectRequest } from '@fathym/common';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime';
import { OpenBiotechWebState } from '../../../../src/state/OpenBiotechWebState.ts';

export const handler: EaCRuntimeHandlers<OpenBiotechWebState> = {
  async POST(req, ctx) {
    const formData = await req.formData();

    const flowing = !!(formData.get('flowing') as string);

    const entLookup = ctx.State.EaC!.EnterpriseLookup!;

    await ctx.State.OBiotechKV.set(
      ['EaC', entLookup, 'Current', 'Flowing'],
      flowing,
    );

    return redirectRequest('/dashboard/getting-started/data', false, false);
  },
};
