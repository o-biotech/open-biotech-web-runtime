import { EaCRuntimeHandlerResult } from '@fathym/eac/runtime';
import { OpenBiotechWebAPIState } from '../../../../src/api/OpenBiotechWebAPIState.ts';
import signalr from 'npm:@microsoft/signalr@8.0.0';

export const handler: EaCRuntimeHandlerResult<OpenBiotechWebAPIState> = {
  GET(_req, _ctx) {
    const connection = new signalr.HubConnectionBuilder()
      .withUrl('https://fr1-iot-devices-flow.azurewebsites.net/api')
      .withAutomaticReconnect()
      // .withUrl('http://localhost:7071/api')
      .build();

    // let timerId: number | undefined;
    const body = new ReadableStream({
      start(controller) {
        connection.on('telemetry', function (messageFromIoTDevice) {
          console.log(messageFromIoTDevice);

          controller.enqueue(
            new TextEncoder().encode(JSON.stringify(messageFromIoTDevice)),
          );
        });

        connection.onclose(() => connection.start().catch(console.error));
        console.log('connecting...');
        connection
          .start()
          .then(() => {
            connection.stream('devices').subscribe({
              next: (stock) => {
                console.log(stock);
                // console.log(stock.Symbol + " " + stock.Price);
              },
              error: (_err) => {},
              complete: () => {},
            });
          })
          .catch(console.error);
      },
      cancel() {
        connection.stop();
      },
    });

    return new Response(body, {
      headers: {
        'Content-Type': 'text/event-stream',
      },
    });
  },
};
