import { JSX } from 'preact';
import { Action, CopyInput, Display } from '@o-biotech/atomic';
import APIDevelopForm from '../../islands/organisms/data/api-develop-form.tsx';

export const IsIsland = true;

export type StorageAPIsDisplayProps = {
  hasStorageCold: boolean;

  hasStorageHot: boolean;

  hasStorageWarm: boolean;

  jwt: string;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function StorageAPIsDisplay(props: StorageAPIsDisplayProps) {
  const { hasStorageCold, hasStorageHot, hasStorageWarm, jwt, ...divProps } = props;

  return (
    <div {...divProps}>
      <h1 class='text-3xl max-w-[500px] mx-auto'>Storage APIs</h1>

      <p class='text-lg max-w-[500px] mx-auto'>
        Storage APIs are used to work with your data across your cold, warm, and hot storage flows.
        Use the following JWT to access your APIs.
      </p>

      <div class='mb-16 mt-8 max-w-sm mx-auto'>
        <label
          for='connStr'
          class='block uppercase tracking-wide font-bold mb-0 text-lg'
        >
          API Access Token
        </label>

        <p>Set Authorization header as 'Bearer (token)'</p>

        <CopyInput id='jwt' name='jwt' type='text' class='mt-2' value={jwt} />
      </div>

      <div class='flex flex-col md:flex-row gap-4 my-8'>
        {hasStorageCold && (
          <Display class='flex-1 p-2 bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black'>
            <h2 class='text-xl'>Cold Storage APIs</h2>

            <p>
              The cold storage API can be used to download a block of data, over a specified
              timeframe, in CSV, JSONLines, and JSON format.
            </p>

            <APIDevelopForm apiPath='/api/o-biotech/data/cold/execute' // jwt={jwt}
            />

            <div class='w-full mb-8 px-8'>
              <p>Use this API to download cold storage data in CSV format.</p>

              <Action
                class='mt-2 text-center'
                href={`/api/o-biotech/data/cold/execute?resultType=csv&download=true&Authorization=${jwt}`}
                target='blank'
                data-eac-bypass-base
              >
                Download Last 7 Days of Data
              </Action>
            </div>
          </Display>
        )}

        {hasStorageWarm && (
          <Display class='flex-1 p-2 bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black'>
            <h2 class='text-xl'>Warm Storage APIs</h2>

            <p>
              Warm data storage can be used to submit dynamic KQL queries against your data,
              allowing for the development of complex data management downstream.
            </p>

            <APIDevelopForm apiPath='/api/o-biotech/data/warm/explorer' // jwt={jwt}
            />

            <div class='w-full mb-8 px-8'>
              <p>
                See this API in action in the 'Payloads' tab in the device data dashboard.
              </p>

              <Action class='mt-2 text-center' href='/'>
                Dashboard
              </Action>
            </div>
          </Display>
        )}

        {hasStorageHot && (
          <Display class='flex-1 p-2 bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black'>
            <h2 class='text-xl'>Hot Storage APIs</h2>

            <p>
              Use SignalR, in any language, to connect to a live stream of your device messages to
              create custom data ingestion and processing logic.
            </p>

            <APIDevelopForm apiPath='/api/o-biotech/data/hot/connect' // jwt={jwt}
            />

            <div class='w-full mb-8 px-8'>
              <p>
                See this API in action in the 'Streaming' tab in the device data dashboard.
              </p>

              <Action class='mt-2 text-center' href='/?tab=streaming'>
                Dashboard
              </Action>
            </div>
          </Display>
        )}
      </div>
    </div>
  );
}
