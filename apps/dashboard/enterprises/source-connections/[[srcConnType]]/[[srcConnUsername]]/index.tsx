import { redirectRequest } from '@fathym/common';
import { EaCSourceConnectionAsCode } from '@fathym/eac-sources';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { waitForStatus } from '@fathym/eac/steward/status';
import { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { PageProps } from '@fathym/eac-applications/preact';
import { DisplayStyleTypes, Hero, HeroStyleTypes } from '@o-biotech/atomic-design-kit';
import { OpenBiotechWebState } from '@o-biotech/common/state';
import GitHubAccessAction from '../../../../../islands/molecules/GitHubAccessAction.tsx';
import DeleteAction from '../../../../../islands/molecules/DeleteAction.tsx';

export type EaCSourceConnectionsPageData = {
  manageSrcConn?: EaCSourceConnectionAsCode;

  manageSrcConnLookup?: string;
};

export const handler: EaCRuntimeHandlerSet<
  OpenBiotechWebState,
  EaCSourceConnectionsPageData
> = {
  GET(_, ctx) {
    const manageSrcConnLookup: string = ctx.Params.srcConnType
      ? `${ctx.Params.srcConnType}://${ctx.Params.srcConnUsername}`
      : '';

    let manageSrcConn: EaCSourceConnectionAsCode | undefined = undefined;

    if (manageSrcConnLookup) {
      manageSrcConn = ctx.State.EaC!.SourceConnections![manageSrcConnLookup]!;

      if (!manageSrcConn) {
        return redirectRequest('/enterprises/source-connections', false, false);
      }
    }

    const data: EaCSourceConnectionsPageData = {
      manageSrcConn: manageSrcConn,
      manageSrcConnLookup: manageSrcConnLookup,
    };

    return ctx.Render(data);
  },

  async DELETE(_req, ctx) {
    const srcConnLookup: string = ctx.Params.srcConnLookup
      ? decodeURIComponent(ctx.Params.srcConnLookup)
      : '';

    const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT!);

    const deleteResp = await eacSvc.EaC.Delete(
      {
        EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup,
        SourceConnections: {
          [srcConnLookup]: null,
        },
        // deno-lint-ignore no-explicit-any
      } as any,
      false,
      60,
    );

    const status = await waitForStatus(
      eacSvc,
      deleteResp.EnterpriseLookup!,
      deleteResp.CommitID,
    );

    return Response.json(status);
  },
};

export default function EaCSourceConnections({
  Data,
}: PageProps<EaCSourceConnectionsPageData>) {
  return (
    <>
      <Hero
        title='Manage EaC Source Connections'
        callToAction='Configure connections to source control providers to access and work with your code.'
        class='[&_*]:mx-auto [&>*>*]:w-full bg-hero-pattern text-center'
        heroStyle={HeroStyleTypes.None}
        displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      >
      </Hero>

      <div class='max-w-sm mx-auto mb-4 mt-4 text-center'>
        <h1 class='text-lg font-bold mb-4'>
          {Data.manageSrcConn
            ? `Manage the '${Data.manageSrcConn.Details?.Name}' source connection`
            : 'Create new source connection'}
        </h1>

        <GitHubAccessAction class='w-full mx-auto'>
          {Data.manageSrcConn ? 'Refresh' : 'Create'} GitHub Source Connection
        </GitHubAccessAction>
      </div>

      {Data.manageSrcConnLookup && (
        <div class='max-w-sm mx-auto mb-4'>
          <DeleteAction
            actionPath={`./source-connections/${Data.manageSrcConnLookup}`}
            message={`Are you sure you want to delete EaC Source Connection '${Data.manageSrcConnLookup}?`}
          >
            Delete EaC Source Connection
          </DeleteAction>
        </div>
      )}
    </>
  );
}
