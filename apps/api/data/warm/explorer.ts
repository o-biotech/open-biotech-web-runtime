import { respond } from '@fathym/common';
import { ExplorerRequest, loadEaCExplorerSvc } from '@fathym/eac/api';
import { EaCRuntimeHandlerResult } from '@fathym/eac/runtime';
import { OpenIndustrialWebAPIState } from '../../../../src/api/OpenIndustrialWebAPIState.ts';

export const handler: EaCRuntimeHandlerResult<OpenIndustrialWebAPIState> = {
  async GET(_req, ctx) {
    const entLookup = ctx.State.EnterpriseLookup;

    const _username = ctx.State.Username;

    const cloudLookup = ctx.State.CloudLookup;

    const resGroupLookup = ctx.State.ResourceGroupLookup;

    const resLookups = ['iot-flow', 'iot-flow-warm'];

    const expReq: ExplorerRequest = {
      Query: `Devices
| order by EnqueuedTime desc
| take 100`,
    };

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

  async POST(req, ctx) {
    const entLookup = ctx.State.EnterpriseLookup;

    const cloudLookup = ctx.State.CloudLookup;

    const resGroupLookup = ctx.State.ResourceGroupLookup;

    const resLookups = ['iot-flow', 'iot-flow-warm'];

    const expReq: ExplorerRequest = await req.json();

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
};
