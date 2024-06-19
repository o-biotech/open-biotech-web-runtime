import { redirectRequest } from '@fathym/common';
import { EaCCloudAsCode, EaCCloudAzureDetails } from '@fathym/eac';
import { EaCStatusProcessingTypes, loadEaCSvc, waitForStatus } from '@fathym/eac/api';
import { EaCRuntimeHandlerResult, PageProps } from '@fathym/eac/runtime';
import { DisplayStyleTypes, EaCManageCloudForm, Hero, HeroStyleTypes } from '@o-biotech/atomic';
import { OpenBiotechWebState } from '../../../../../src/state/OpenBiotechWebState.ts';
import { OpenBiotechEaC } from '../../../../../src/eac/OpenBiotechEaC.ts';
import DeleteAction from '../../../../islands/molecules/DeleteAction.tsx';

export type EaCCloudsPageData = {
  entLookup: string;

  manageCloud?: EaCCloudAsCode;

  manageCloudLookup?: string;
};

export const handler: EaCRuntimeHandlerResult<
  OpenBiotechWebState,
  EaCCloudsPageData
> = {
  GET(_, ctx) {
    const manageCloudLookup = ctx.Params.cloudLookup;

    let manageCloud: EaCCloudAsCode | undefined = undefined;

    if (manageCloudLookup) {
      manageCloud = ctx.State.EaC!.Clouds![manageCloudLookup]!;

      if (!manageCloud) {
        return redirectRequest('/enterprises/clouds', false, false);
      }
    }

    const data: EaCCloudsPageData = {
      entLookup: ctx.State.EaC!.EnterpriseLookup!,
      manageCloud: manageCloud,
      manageCloudLookup: manageCloudLookup,
    };

    return ctx.Render(data);
  },

  async POST(req, ctx) {
    const formData = await req.formData();

    const cloudLookup = formData.get('cloudLookup') as string;

    const saveEaC: OpenBiotechEaC = {
      EnterpriseLookup: formData.get('entLookup') as string,
      Clouds: {
        [cloudLookup]: {
          Details: {
            Name: formData.get('name') as string,
            Description: formData.get('description') as string,
            TenantID: formData.get('tenant-id') as string,
            SubscriptionID: formData.get('subscription-id') as string,
            ApplicationID: formData.get('application-id') as string,
            AuthKey: formData.get('auth-key') as string,
            Type: 'Azure',
          } as EaCCloudAzureDetails,
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
      return redirectRequest('/enterprises/clouds', false, false);
    } else {
      return redirectRequest(
        `/enterprises/clouds?commitId=${commitResp.CommitID}`,
        false,
        false,
      );
    }
  },

  async DELETE(_req, ctx) {
    const cloudLookup = ctx.Params.cloudLookup!;

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const deleteResp = await eacSvc.Delete(
      {
        EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup,
        Clouds: {
          [cloudLookup]: null,
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

export default function EaCClouds({ Data }: PageProps<EaCCloudsPageData>) {
  const details: EaCCloudAzureDetails | undefined = Data.manageCloud
    ?.Details as EaCCloudAzureDetails;
  return (
    <>
      <Hero
        title='Manage EaC Clouds'
        callToAction='Connect and manage access to your clouds.'
        class='[&_*]:mx-auto [&>*>*]:w-full bg-hero-pattern text-center'
        heroStyle={HeroStyleTypes.None}
        displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      >
      </Hero>

      <EaCManageCloudForm
        entLookup={Data.entLookup}
        cloudLookup={Data.manageCloudLookup || ''}
        cloudName={details?.Name || ''}
        cloudDescription={details?.Description || ''}
        cloudTenantID={details?.TenantID || ''}
        cloudSubscriptionID={details?.SubscriptionID || ''}
        cloudApplicationID={details?.ApplicationID || ''}
        cloudAuthKey={details?.AuthKey || ''}
      />

      {Data.manageCloudLookup && (
        <div class='max-w-sm mx-auto mb-4'>
          <DeleteAction
            actionPath={`./clouds/${Data.manageCloudLookup}`}
            message={`Are you sure you want to delete EaC Cloud '${Data.manageCloudLookup}?`}
          >
            Delete EaC DevOps Action
          </DeleteAction>
        </div>
      )}
    </>
  );
}
