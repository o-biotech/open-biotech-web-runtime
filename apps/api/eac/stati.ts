import { respond } from '@fathym/common';
import { EaCStatusProcessingTypes, loadEaCSvc } from '@fathym/eac/api';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime';
import { OpenBiotechWebState } from '../../../src/state/OpenBiotechWebState.ts';

export const handler: EaCRuntimeHandlers<OpenBiotechWebState> = {
  async GET(req, ctx) {
    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const url = new URL(req.url);

    const takeParam = url.searchParams.get('take');

    const statusTypes = url.searchParams
      .getAll('statusType')
      ?.map((st) => Number.parseInt(st) as EaCStatusProcessingTypes);

    const take = takeParam ? Number.parseInt(takeParam) : undefined;

    const eacStati = await eacSvc.ListStati(
      ctx.State.EaC!.EnterpriseLookup!,
      take,
      statusTypes,
    );

    return respond(eacStati);
  },
};
