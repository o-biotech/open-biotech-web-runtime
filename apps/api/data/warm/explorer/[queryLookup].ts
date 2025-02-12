import { respond } from '@fathym/common';
import { ExplorerRequest } from '@fathym/eac/api';
import { loadEaCExplorerSvc, loadEaCSvc } from '@fathym/eac/api/clients';
import { EaCRuntimeHandlerResult } from '@fathym/eac/runtime';
import { OpenBiotechWebAPIState } from '../../../../../src/api/OpenBiotechWebAPIState.ts';
import { OpenBiotechEaC } from '../../../../../src/eac/OpenBiotechEaC.ts';

export const handler: EaCRuntimeHandlerResult<OpenBiotechWebAPIState> = {
  async GET(_req, ctx) {
    const entLookup = ctx.State.EnterpriseLookup;

    const _username = ctx.State.Username;

    const cloudLookup = ctx.State.CloudLookup;

    const resGroupLookup = ctx.State.ResourceGroupLookup;

    const resLookups = ['iot-flow', 'iot-flow-warm'];

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const eac: OpenBiotechEaC = await eacSvc.Get(entLookup);

    let expReq: ExplorerRequest = {
      Query: `Devices
        | order by EnqueuedTime desc
        | take 100`,
    };

    if (eac.WarmQueries && ctx.Params.QueryLookup && ctx.Params.QueryLookup in eac.WarmQueries) {
      expReq = {
        Query: eac.WarmQueries[ctx.Params.QueryLookup]
      };
    }

    const eacExplorerSvc = await loadEaCExplorerSvc(ctx.State.EaCJWT!);

    const queryResp = await eacExplorerSvc.Query(
      entLookup,
      cloudLookup,
      resGroupLookup,
      resLookups,
      'Telemetry',
      expReq,
    );

    return respond(JSON.stringify(queryResp));
  },
}