import { redirectRequest } from '@fathym/common';
import { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { PageProps } from '@fathym/eac-applications/runtime/preact';
import { DisplayStyleTypes, Hero, HeroStyleTypes } from '@o-biotech/atomic-design-kit';
import { ApplicationsPhaseTypes, OpenBiotechWebState } from '@o-biotech/common/state';
import { ApplicationsStepsFeatures } from '../../../components/organisms/features/ApplicationsStepsFeatures.tsx';

interface ApplicationsPageData {
  appsPhase: ApplicationsPhaseTypes;
}

export const handler: EaCRuntimeHandlerSet<
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
