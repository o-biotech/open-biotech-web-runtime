import { loadJwtConfig } from '@fathym/eac';
import { EaCRuntimeHandlerResult, PageProps } from '@fathym/eac/runtime';
import { DisplayStyleTypes, Hero, HeroStyleTypes } from '@o-biotech/atomic';
import { OpenBiotechWebState } from '../../../src/state/OpenBiotechWebState.ts';
import { StorageAPIsDisplay } from '../../components/molecules/StorageAPIsDisplay.tsx';

export const IsIsland = true;

interface APIsPageData {
  hasStorageCold: boolean;

  hasStorageHot: boolean;

  hasStorageWarm: boolean;

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
      hasStorageCold: !!ctx.State.Cloud.Storage?.Cold,
      hasStorageHot: !!ctx.State.Cloud.Storage?.Hot,
      hasStorageWarm: !!ctx.State.Cloud.Storage?.Warm,
      jwt: jwt,
    };

    return ctx.Render(data);
  },
};

export default function APIs({ Data }: PageProps<APIsPageData>) {
  return (
    <>
      <Hero
        title='Develop IoT Solutions'
        callToAction='Leverage the built in APIs to gain access to your data to create custom solutions.'
        class='[&_*]:mx-auto [&>*>*]:w-full bg-hero-pattern text-center'
        heroStyle={HeroStyleTypes.None}
        displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      >
      </Hero>

      <StorageAPIsDisplay
        class='m-8 md:m-16'
        hasStorageCold={Data.hasStorageCold}
        hasStorageHot={Data.hasStorageHot}
        hasStorageWarm={Data.hasStorageWarm}
        jwt={Data.jwt}
      />
    </>
  );
}
