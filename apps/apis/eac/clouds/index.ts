import { redirectRequest } from '@fathym/common';
import { EaCCloudAzureDetails } from '@fathym/eac-azure';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { EaCStatusProcessingTypes, waitForStatus } from '@fathym/eac/steward/status';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenBiotechEaC } from '@o-biotech/common/utils';
import { OpenBiotechWebState } from '@o-biotech/common/state';

export const handler: EaCRuntimeHandlers<OpenBiotechWebState> = {
  async POST(req, ctx) {
    const formData = await req.formData();

    const cloudLookup = (formData.get('cloudLookup') as string) || crypto.randomUUID();

    const eac: OpenBiotechEaC = {
      EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup,
      Clouds: {
        [cloudLookup]: {
          Token: ctx.State.Cloud.AzureAccessToken,
          Details: {
            Name: formData.get('name') as string,
            Description: formData.get('description') as string,
            ApplicationID: formData.get('application-id') as string,
            AuthKey: formData.get('auth-key') as string,
            SubscriptionID: formData.get('subscription-id') as string,
            TenantID: formData.get('tenant-id') as string,
            Type: 'Azure',
          } as EaCCloudAzureDetails,
        },
      },
    };

    const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT!);

    const commitResp = await eacSvc.EaC.Commit(eac, 60);

    const status = await waitForStatus(
      eacSvc,
      commitResp.EnterpriseLookup,
      commitResp.CommitID,
    );

    if (status.Processing == EaCStatusProcessingTypes.COMPLETE) {
      return redirectRequest('/dashboard/getting-started/cloud', false, false);
    } else {
      return redirectRequest(
        `/dashboard/getting-started/cloud?commitId=${commitResp.CommitID}`,
        false,
        false,
      );
    }
  },
};
