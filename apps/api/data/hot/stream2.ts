import { EaCRuntimeHandlerResult } from '@fathym/eac/runtime';
import { OpenIndustrialWebAPIState } from '../../../../src/api/OpenIndustrialWebAPIState.ts';
import {
  StandardWebSocketClient,
  WebSocketClient,
} from 'https://deno.land/x/websocket@v0.1.4/mod.ts';

export const handler: EaCRuntimeHandlerResult<OpenIndustrialWebAPIState> = {
  async GET(_req, _ctx) {
    const negotiation = await fetch(
      `https://fr1-iot-devices-flow.azurewebsites.net/api/negotiate`,
    );

    const negotiationData = await negotiation.json();

    const endpoint = `${negotiationData.url.replace('https', 'wss')}`; //&connectionToken=${negotiationData.accessToken}`;

    const ws: WebSocketClient = new StandardWebSocketClient(endpoint);
    // ws.on('error', (err: any) => {
    //   console.error(err);
    // });
    ws.on('open', function () {
      console.log('ws connected!');
      ws.send('something');
    });
    ws.on('message', function (message: string) {
      console.log(message);
    });
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(JSON.stringify(negotiationData)),
        );
      },
      cancel() {},
    });

    return new Response(body, {
      headers: {
        'Content-Type': 'text/event-stream',
      },
    });
  },
};
