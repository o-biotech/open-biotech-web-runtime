import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { EaCStatusProcessingTypes } from '@fathym/eac/steward/status';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenBiotechWebState } from '@o-biotech/common/state';

export const handler: EaCRuntimeHandlers<OpenBiotechWebState> = {
  async GET(req, ctx) {
    const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT!);

    const url = new URL(req.url);

    const takeParam = url.searchParams.get('take');

    const statusTypes = url.searchParams
      .getAll('statusType')
      ?.map((st) => Number.parseInt(st) as EaCStatusProcessingTypes);

    const take = takeParam ? Number.parseInt(takeParam) : undefined;

    const eacStati = await eacSvc.Status.ListStati(
      ctx.State.EaC!.EnterpriseLookup!,
      take,
      statusTypes,
    );

    return Response.json(eacStati);
  },
};
