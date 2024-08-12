import { EaCRuntimeHandlers } from '@fathym/eac/runtime';
import { OpenBiotechWebAPIState } from '../../../../../src/api/OpenBiotechWebAPIState.ts';

export const handler: EaCRuntimeHandlers<OpenBiotechWebAPIState> = {
  async GET(req, ctx) {
    const origin = req.headers.get('Origin') || '*';

    const shortName = ctx.State.ResourceGroupLookup.split('-')
      .map((p) => p.charAt(0))
      .join('');

    const negResp = await fetch(
      `https://${shortName}-iot-devices-flow.azurewebsites.net/api/negotiate`,
    );

    const text = await negResp.text();

    const resp = new Response(text);

    const headers = resp.headers;

    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, x-signalr-user-agent',
    );
    headers.set(
      'Access-Control-Allow-Methods',
      'POST, OPTIONS, GET, PUT, DELETE',
    );

    return resp;
  },

  POST(req, ctx) {
    return handler.GET!(req, ctx);
  },

  OPTIONS(req, ctx) {
    return handler.GET!(req, ctx);
  },
};
