import { EaCRuntimeHandlerResult, PageProps } from '@fathym/eac/runtime';
import { DisplayStyleTypes, Hero, HeroStyleTypes } from '@o-biotech/atomic';
import { DevicesPhaseTypes } from '../../../../src/state/DevicesPhaseTypes.ts';
import { DevicesStepsFeatures } from '../../../components/organisms/features/DevicesStepsFeatures.tsx';
import { redirectRequest } from '@fathym/common';
import { OpenBiotechWebState } from '../../../../src/state/OpenBiotechWebState.ts';

interface DevicesPageData {
  cloudLookup: string;

  devicesPhase: DevicesPhaseTypes;

  iotLookup: string;

  jwt: string;

  resGroupLookup: string;
}

export const handler: EaCRuntimeHandlerResult<
  OpenBiotechWebState,
  DevicesPageData
> = {
  GET: (_req, ctx) => {
    // const {} = ctx.params;

    // const resp = await fetch(`https://api.github.com/users/${username}`);
    // if (resp.status === 404) {
    //   return ctx.render(null);
    // }

    if (ctx.State.Phase < 1) {
      return redirectRequest('/', false, false);
    }

    const data: DevicesPageData = {
      cloudLookup: ctx.State.Cloud.CloudLookup!,
      devicesPhase: ctx.State.Devices.Phase,
      iotLookup: ctx.State.Devices.IoTLookup!,
      jwt: ctx.State.Devices.JWT!,
      resGroupLookup: ctx.State.Cloud.ResourceGroupLookup!,
    };

    return ctx.Render(data);
  },
};

export default function Devices({
  Data,
}: PageProps<DevicesPageData>) {
  return (
    <div>
      <Hero
        title='Device Configuration'
        callToAction='Register a device and select dashboard services.'
        class='[&_*]:mx-auto [&>*>*]:w-full bg-hero-pattern text-center'
        heroStyle={HeroStyleTypes.None}
        displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      />

      <DevicesStepsFeatures
        cloudLookup={Data!.cloudLookup}
        iotLookup={Data!.iotLookup}
        jwt={Data!.jwt}
        resGroupLookup={Data!.resGroupLookup}
        devicesPhase={Data!.devicesPhase}
      />
    </div>
  );
}
