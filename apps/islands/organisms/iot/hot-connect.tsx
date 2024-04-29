import { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { IS_BROWSER } from '@fathym/eac/runtime/browser';
import * as signalR from 'npm:@microsoft/signalr@8.0.0/dist/browser/signalr.js';
import { Action, CopyInput } from '@o-biotech/atomic';
import { RenewIcon } from '../../../../build/iconset/icons/RenewIcon.tsx';
import { ChevronDownIcon } from '../../../../build/iconset/icons/ChevronDownIcon.tsx';

export const IsIsland = true;

export type HotConnectProps = {
  jwt: string;

  takeRows: number;
} & JSX.HTMLAttributes<HTMLDivElement>;

export default function HotConnect(props: HotConnectProps) {
  if (!IS_BROWSER) {
    return (
      <>
        <RenewIcon class='w-20 h-20 text-blue-500 animate-spin inline-block m-4' />
      </>
    );
  }

  const [jwt] = useState(props.jwt);

  const [takeRows] = useState(props.takeRows);

  const [hotPayloads, setHotPayloads] = useState<Record<string, unknown>[]>([]);

  const [connection, setConnection] = useState<
    signalR.HubConnectionBuilder | undefined
  >(undefined);

  const [running, setRunning] = useState(true);

  const initConnection = () => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`/api/o-biotech/data/hot/connect`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
      .withAutomaticReconnect()
      .build();

    conn.on(
      'telemetry',
      function (messageFromIoTDevice: Record<string, unknown>) {
        console.log(messageFromIoTDevice);

        hotPayloads.unshift(messageFromIoTDevice);

        setHotPayloads(hotPayloads.slice(0, takeRows));
      },
    );

    conn.onclose(() => connection.start().catch(console.error));

    setConnection(conn);
  };

  useEffect(() => {
    if (jwt) {
      initConnection();
    }
  }, [jwt, takeRows]);

  useEffect(() => {
    if (connection) {
      console.log('connecting...');

      connection.start().catch(console.error);

      return () => {
        connection?.stop();
      };
    }
  }, [connection]);

  useEffect(() => {
    if (connection && !running) {
      connection.stop();

      setConnection(undefined);
    } else {
      initConnection();
    }
  }, [running]);

  return (
    <div class='flex flex-col divide-y divide-gray-300 dark:divide-gray-700 h-full relative overflow-auto'>
      <Action class='my-4 p-1' onClick={() => setRunning(!running)}>
        {running ? 'Pause' : 'Continue'}
      </Action>

      {hotPayloads.length > 0
        ? (
          hotPayloads.map((hotPayload) => {
            const flat = JSON.stringify(hotPayload);

            const structured = JSON.stringify(hotPayload, null, 2);

            const uniqueKey = crypto.randomUUID();

            return (
              <div
                class='flex-1 flex flex-wrap items-center p-2'
                key={uniqueKey}
              >
                <div class='flex-1 md:hidden'>{flat.slice(0, 25)}</div>

                <div class='flex-1 hidden md:block'>{flat.slice(0, 80)}</div>

                <div class='flex-none'>
                  <CopyInput class='hidden' value={structured} />
                </div>

                <input id={uniqueKey} type='checkbox' class={`sr-only peer`} />

                <label
                  for={uniqueKey}
                  class={`cursor-pointer transition-all duration-200 peer-checked:rotate-[-180deg]`}
                >
                  <ChevronDownIcon class='w-6 h-6' />
                </label>

                <div
                  class={`hidden peer-checked:block w-full m-2 p-2 shadow shadow-inner bg-gray-200 dark:bg-gray-700`}
                >
                  <pre>{structured}</pre>
                </div>
              </div>
            );
          })
        )
        : (
          <h1 class='text-xl my-4'>
            There are no hot payloads to show at this time.
            <br />
            Once data is streaming, it will show up here.
          </h1>
        )}
    </div>
  );
}
