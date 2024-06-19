import { redirectRequest } from '@fathym/common';
import { EaCDevOpsActionAsCode } from '@fathym/eac';
import { EaCStatusProcessingTypes, loadEaCSvc, waitForStatus } from '@fathym/eac/api';
import { EaCRuntimeHandlerResult, PageProps } from '@fathym/eac/runtime';
import {
  DisplayStyleTypes,
  EaCManageDevOpsActionForm,
  Hero,
  HeroStyleTypes,
} from '@o-biotech/atomic';
import { OpenBiotechWebState } from '../../../../../src/state/OpenBiotechWebState.ts';
import { OpenBiotechEaC } from '../../../../../src/eac/OpenBiotechEaC.ts';
import DeleteAction from '../../../../islands/molecules/DeleteAction.tsx';

export type EaCDevOpsActionsPageData = {
  entLookup: string;

  manageDoa?: EaCDevOpsActionAsCode;

  manageDoaLookup?: string;
};

export const handler: EaCRuntimeHandlerResult<
  OpenBiotechWebState,
  EaCDevOpsActionsPageData
> = {
  GET(_, ctx) {
    const manageDoaLookup = ctx.Params.doaLookup;

    let manageDoa: EaCDevOpsActionAsCode | undefined = undefined;

    if (manageDoaLookup) {
      manageDoa = ctx.State.EaC!.DevOpsActions![manageDoaLookup]!;

      if (!manageDoa) {
        return redirectRequest('/enterprises/devops-actions', false, false);
      }
    }

    const data: EaCDevOpsActionsPageData = {
      entLookup: ctx.State.EaC!.EnterpriseLookup!,
      manageDoa: manageDoa,
      manageDoaLookup: manageDoaLookup,
    };

    return ctx.Render(data);
  },

  async POST(req, ctx) {
    const formData = await req.formData();

    const doaLookup = formData.get('doaLookup') as string;

    const saveEaC: OpenBiotechEaC = {
      EnterpriseLookup: formData.get('entLookup') as string,
      DevOpsActions: {
        [doaLookup]: {
          Details: {
            Name: formData.get('name') as string,
            Description: formData.get('description') as string,
            Path: formData.get('path') as string,
            Templates: (formData.get('templatePaths') as string).split('\r\n'),
          },
        },
      },
    };

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const commitResp = await eacSvc.Commit<OpenBiotechEaC>(saveEaC, 60);

    const status = await waitForStatus(
      eacSvc,
      commitResp.EnterpriseLookup,
      commitResp.CommitID,
    );

    if (status.Processing == EaCStatusProcessingTypes.COMPLETE) {
      return redirectRequest('/enterprises/devops-actions', false, false);
    } else {
      return redirectRequest(
        `/enterprises/devops-actions?commitId=${commitResp.CommitID}`,
        false,
        false,
      );
    }
  },

  async DELETE(_req, ctx) {
    const doaLookup = ctx.Params.doaLookup!;

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const deleteResp = await eacSvc.Delete(
      {
        EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup,
        DevOpsActions: {
          [doaLookup]: null,
        },
      },
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

export default function EaCDevOpsActions({
  Data,
}: PageProps<EaCDevOpsActionsPageData>) {
  return (
    <>
      <Hero
        title='Manage EaC DevOps Action'
        callToAction='Configure reusable DevOps Action profiles to manage build processes for your source control locations.'
        class='[&_*]:mx-auto [&>*>*]:w-full bg-hero-pattern text-center'
        heroStyle={HeroStyleTypes.None}
        displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      >
      </Hero>

      <EaCManageDevOpsActionForm
        entLookup={Data.entLookup}
        doaLookup={Data.manageDoaLookup || ''}
        doaName={Data.manageDoa?.Details?.Name || ''}
        doaDescription={Data.manageDoa?.Details?.Description || ''}
        doaPath={Data.manageDoa?.Details?.Path || ''}
        doaTemplatePaths={Data.manageDoa?.Details?.Templates || []}
      />

      {Data.manageDoaLookup && (
        <div class='max-w-sm mx-auto mb-4'>
          <DeleteAction
            actionPath={`./devops-actions/${Data.manageDoaLookup}`}
            message={`Are you sure you want to delete EaC DevOps Action '${Data.manageDoaLookup}?`}
          >
            Delete EaC DevOps Action
          </DeleteAction>
        </div>
      )}
    </>
  );
}
