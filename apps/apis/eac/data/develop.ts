import { redirectRequest } from '@fathym/common';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenBiotechWebState } from '@o-biotech/common/state';

export const handler: EaCRuntimeHandlers<OpenBiotechWebState> = {
  async POST(req, ctx) {
    console.log('******************************');
    const formData = await req.formData();

    const flowing = !!(formData.get('developed') as string);

    const entLookup = ctx.State.EaC!.EnterpriseLookup!;

    await ctx.State.OBiotechKV.set(['EaC', entLookup, 'Current', 'Developed'], flowing);

    return redirectRequest('/dashboard', false, false);
  },
};
