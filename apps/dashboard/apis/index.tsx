import { loadJwtConfig } from '@fathym/eac';
import { EaCRuntimeHandlerResult, PageProps } from '@fathym/eac/runtime';
import { Action, Display, DisplayStyleTypes, Hero, HeroStyleTypes } from '@o-biotech/atomic';
import { OpenBiotechWebState } from '../../../src/state/OpenBiotechWebState.ts';
import APIDevelopForm from '../../islands/organisms/data/api-develop-form.tsx';

interface APIsPageData {
  jwt: string;
}

export const handler: EaCRuntimeHandlerResult<
  OpenBiotechWebState,
  APIsPageData
> = {
  GET: async (_req, ctx) => {
    const jwt = await loadJwtConfig().Create({
      EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup!,
      CloudLookup: ctx.State.Cloud.CloudLookup!,
      ResourceGroupLookup: ctx.State.Cloud.ResourceGroupLookup!,
      Username: ctx.State.Username,
    });

    const data: APIsPageData = {
      jwt: jwt,
    };

    return ctx.Render(data);
  },
};

export default function APIs({
  Data,
}: PageProps<APIsPageData>) {
  return (
    <>
      <Hero
        title='Develop IoT Solutions'
        class='[&_*]:mx-auto [&>*>*]:w-full bg-[#000028] text-center'
        heroStyle={HeroStyleTypes.None}
        displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      >
      </Hero>

      <div class='flex flex-col md:flex-row gap-4 my-8 mx-4'>
        <Display class='flex-1 p-2 bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black'>
          <h2 class='text-xl'>Cold Storage APIs</h2>

          <p>
            Use the following to call this API.
          </p>

          <APIDevelopForm apiPath='/api/o-biotech/data/cold/execute' jwt={Data.jwt} />

          <div class='w-full mb-8 px-8'>
            <p>
              Use this API to download cold storage data in CSV format.
            </p>

            <Action
              class='mt-2 text-center'
              href={`/api/o-biotech/data/cold/execute?resultType=true&download=true&Authorization=${Data.jwt}`}
              target='blank'
            >
              Download Last 7 Days of Data
            </Action>
          </div>
        </Display>

        <Display class='flex-1 p-2 bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black'>
          <h2 class='text-xl'>Warm Storage APIs</h2>

          <p>
            Use the following to call this API.
          </p>

          <APIDevelopForm apiPath='/api/o-biotech/data/warm/explorer' jwt={Data.jwt} />

          <div class='w-full mb-8 px-8'>
            <p>
              See this API in action in the 'Payloads' tab in the device data dashboard.
            </p>

            <Action class='mt-2 text-center' href='/'>
              Dashboard
            </Action>
          </div>
        </Display>

        <Display class='flex-1 p-2 bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black'>
          <h2 class='text-xl'>Hot Storage APIs</h2>

          <p>
            Use the following to call this API and connect to a SignalR client in any language.
          </p>

          <APIDevelopForm apiPath='/api/o-biotech/data/hot/connect' jwt={Data.jwt} />

          <div class='w-full mb-8 px-8'>
            <p>
              See this API in action in the 'Streaming' tab in the device data dashboard.
            </p>

            <Action class='mt-2 text-center' href='/?tab=streaming'>
              Dashboard
            </Action>
          </div>
        </Display>
      </div>
    </>
  );
}
