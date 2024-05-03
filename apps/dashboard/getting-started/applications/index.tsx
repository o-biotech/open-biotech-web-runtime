import { redirectRequest } from '@fathym/common';
import { EaCRuntimeHandlerResult, PageProps } from '@fathym/eac/runtime';
import { DisplayStyleTypes, Hero, HeroStyleTypes } from '@o-biotech/atomic';
import { ApplicationsStepsFeatures } from '../../../components/organisms/features/ApplicationsStepsFeatures.tsx';
import { ApplicationsPhaseTypes } from '../../../../src/state/ApplicationsPhaseTypes.ts';
import { OpenBiotechWebState } from '../../../../src/state/OpenBiotechWebState.ts';

interface ApplicationsPageData {
  appsPhase: ApplicationsPhaseTypes;
}

export const handler: EaCRuntimeHandlerResult<
  OpenBiotechWebState,
  ApplicationsPageData
> = {
  GET: (_req, ctx) => {
    // const {} = ctx.params;

    // const resp = await fetch(`https://api.github.com/users/${username}`);
    // if (resp.status === 404) {
    //   return ctx.render(null);
    // }

    if (ctx.State.Phase < 3) {
      return redirectRequest('/', false, false);
    }

    const data: ApplicationsPageData = {
      appsPhase: ApplicationsPhaseTypes.GitHub,
    };

    return ctx.Render(data);
  },
};

export default function Devices({
  Data,
}: PageProps<ApplicationsPageData | null>) {
  return (
    <div>
      <Hero
        title='Applications & Collaboration'
        callToAction='Develop applications to share data, collaborate with colleagues or develop complete consumer applications.'
        class='[&_*]:mx-auto [&>*>*]:w-full bg-hero-pattern text-center'
        heroStyle={HeroStyleTypes.None}
        displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      />

      <ApplicationsStepsFeatures appsPhase={Data!.appsPhase} />
    </div>
  );
}
