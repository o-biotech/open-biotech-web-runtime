import { redirectRequest } from '@fathym/common';
import { EaCUserRecord, EverythingAsCode } from '@fathym/eac';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { EaCStatusProcessingTypes, waitForStatus } from '@fathym/eac/steward/status';
import { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { PageProps } from '@fathym/eac-applications/preact';
import { EaCManageForm, EnterpriseManagementItem } from '@o-biotech/atomic-design-kit';
import { OpenBiotechWebState } from '@o-biotech/common/state';
import CreateEaCHero from '../../../components/organisms/heros/CreateEaCHero.tsx';
import { OpenBiotechEaC } from '@o-biotech/common/utils';

export type EnterprisesPageData = {
  currentEaC?: OpenBiotechEaC;

  enterprises: EaCUserRecord[];

  manageEaC?: OpenBiotechEaC;
};

export const handler: EaCRuntimeHandlerSet<
  OpenBiotechWebState,
  EnterprisesPageData
> = {
  async GET(_, ctx) {
    const manageEaCLookup = ctx.Params.entLookup!;

    let manageEaC: OpenBiotechEaC | undefined = undefined;

    if (manageEaCLookup) {
      const parentEaCSvc = await loadEaCStewardSvc();

      const jwtResp = await parentEaCSvc.EaC.JWT(
        manageEaCLookup,
        ctx.State.Username,
      );

      const eacSvc = await loadEaCStewardSvc(jwtResp.Token);

      manageEaC = await eacSvc.EaC.Get(manageEaCLookup);

      if (!manageEaC?.EnterpriseLookup) {
        return redirectRequest('/dashboard/enterprises', false, false);
      }
    }

    const data: EnterprisesPageData = {
      currentEaC: ctx.State.EaC,
      enterprises: [],
      manageEaC: manageEaC,
    };

    data.enterprises = ctx.State.UserEaCs!;

    return ctx.Render(data);
  },

  async PUT(req, ctx) {
    const eac: EverythingAsCode = await req.json();

    const denoKv = await ctx.Runtime.IoC.Resolve(Deno.Kv, 'o-biotech');

    await denoKv.set(
      ['User', ctx.State.Username!, 'Current', 'EnterpriseLookup'],
      eac.EnterpriseLookup,
    );

    console.log(`Set Active EaC to ${eac.EnterpriseLookup}`);

    return Response.json({ Processing: EaCStatusProcessingTypes.COMPLETE });
  },

  async DELETE(req, ctx) {
    console.log('DELETE');
    const eac: EverythingAsCode = await req.json();

    const parentEaCSvc = await loadEaCStewardSvc();

    const username = ctx.State.Username;

    const jwt = await parentEaCSvc.EaC.JWT(eac.EnterpriseLookup, username);

    const eacSvc = await loadEaCStewardSvc(jwt.Token);

    // deno-lint-ignore no-explicit-any
    const deleteResp = await eacSvc.EaC.Delete(eac as any, true, 60);

    const status = await waitForStatus(
      eacSvc,
      eac.EnterpriseLookup!,
      deleteResp.CommitID,
    );

    const denoKv = await ctx.Runtime.IoC.Resolve(Deno.Kv, 'o-biotech');

    const currentEaC = await denoKv.get<string>([
      'User',
      ctx.State.Username,
      'Current',
      'EnterpriseLookup',
    ]);

    if (currentEaC.value === eac.EnterpriseLookup && ctx.State.UserEaCs) {
      const nextCurrentEaC = ctx.State.UserEaCs.find(
        (ue) => ue.EnterpriseLookup !== eac.EnterpriseLookup,
      );

      if (nextCurrentEaC) {
        await denoKv.set(
          ['User', ctx.State.Username, 'Current', 'EnterpriseLookup'],
          nextCurrentEaC.EnterpriseLookup!,
        );
      }
    }

    return Response.json(status);
  },
};

export default function Enterprises({ Data }: PageProps<EnterprisesPageData>) {
  return (
    <>
      <CreateEaCHero
        title={Data.manageEaC ? 'Manage Enterprise' : 'Create Enterprise'}
      />

      <EaCManageForm
        action='/api/o-biotech/eac'
        data-eac-bypass-base
        entLookup={Data.manageEaC?.EnterpriseLookup}
        entName={Data.manageEaC?.Details?.Name || undefined}
        entDescription={Data.manageEaC?.Details?.Description || undefined}
        hideTitle
      />

      {Data.enterprises?.length > 0 && (
        <div class='max-w-sm m-auto mt-8'>
          <label
            for='subscription-plan'
            class='block uppercase tracking-wide font-bold mb-2 text-xl text-center'
          >
            Enterprise {Data.manageEaC?.EnterpriseLookup ? 'Management' : 'Options'}
          </label>

          <div class='border-b-[1px] border-dotted border-slate-400 dark:border-slate-700'></div>

          {Data.enterprises.map((enterprise) => {
            return !Data.manageEaC ||
                Data.manageEaC.EnterpriseLookup ===
                  enterprise.EnterpriseLookup
              ? (
                <EnterpriseManagementItem
                  active={Data.currentEaC?.EnterpriseLookup ===
                    enterprise.EnterpriseLookup}
                  deleteActionPath={`./enterprises/${enterprise.EnterpriseLookup}`}
                  enterprise={enterprise}
                  manage={Data.manageEaC?.EnterpriseLookup ===
                    enterprise.EnterpriseLookup}
                  setActiveActionPath={`./enterprises/${enterprise.EnterpriseLookup}`}
                />
              )
              : undefined;
          })}
        </div>
      )}
    </>
  );
}
