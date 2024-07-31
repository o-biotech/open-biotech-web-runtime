import { respond } from '@fathym/common';
import { loadEaCAzureSvc } from '@fathym/eac/api';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime';
import { OpenBiotechWebAPIState } from '../../../../src/api/OpenBiotechWebAPIState.ts';

export const handler: EaCRuntimeHandlers<OpenBiotechWebAPIState> = {
  async GET(req, ctx) {
    const entLookup = ctx.State.EnterpriseLookup;

    const cloudLookup = ctx.State.CloudLookup;

    const url = new URL(req.url);

    const scopes: string[] = (url.searchParams.get('scope') as string).split(
      ',',
    );

    const eacAzureSvc = await loadEaCAzureSvc(ctx.State.EaCJWT!);

    const authToken = await eacAzureSvc.CloudAuthToken(
      entLookup,
      cloudLookup,
      scopes,
    );

    return respond(authToken);
  },
};
