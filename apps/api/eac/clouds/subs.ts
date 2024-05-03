import { redirectRequest } from '@fathym/common';
import { EaCCloudDetails } from '@fathym/eac';
import { EaCStatusProcessingTypes, loadEaCSvc, waitForStatus } from '@fathym/eac/api';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime';
import { OpenBiotechEaC } from '../../../../src/eac/OpenBiotechEaC.ts';
import { OpenBiotechWebState } from '../../../../src/state/OpenBiotechWebState.ts';

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
            Name: formData.get('subscription-name') as string,
            Description: formData.get('subscription-name') as string,
            SubscriptionID: formData.get('subscription-id') as string,
            IsDev: !!formData.get('is-dev'),
            BillingScope: formData.get('billing-scope') as string,
            Type: 'Azure',
          } as EaCCloudDetails,
        },
      },
    };

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const commitResp = await eacSvc.Commit(eac, 60);

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
