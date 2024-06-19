import { loadEaCSvc } from '@fathym/eac/api';
import { EaCRuntimeHandlerResult } from '@fathym/eac/runtime';
import { OpenIndustrialWebAPIState } from '../../../src/api/OpenIndustrialWebAPIState.ts';

export const handler: EaCRuntimeHandlerResult<OpenIndustrialWebAPIState> = async (
  _req,
  ctx,
) => {
  const parentEaCSvc = await loadEaCSvc();

  const entLookup = ctx.State.EnterpriseLookup;

  const username = ctx.State.Username;

  const jwt = await parentEaCSvc.JWT(entLookup, username);

  ctx.State.EaCJWT = jwt.Token;

  return await ctx.Next();
};
