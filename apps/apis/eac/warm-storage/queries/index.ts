import { redirectRequest } from '@fathym/common';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { EaCStatusProcessingTypes, waitForStatus } from '@fathym/eac/steward/status';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenBiotechEaC } from '@o-biotech/common/utils';
import { OpenBiotechWebState } from '@o-biotech/common/state';

export const handler: EaCRuntimeHandlers<OpenBiotechWebState> = {
  async POST(req, ctx) {
    const formData = await req.formData();

    const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT!);

    const lookup = formData.get('lookup')!.toString();

    const eac: OpenBiotechEaC = {
      EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup,
      WarmQueries: {
        [lookup]: {
          Details: {
            Name: formData.get('name')!.toString(),
            Description: formData.get('name')!.toString(),
            Version: 1,
            Query: formData.get('query')!.toString(),
          },
        },
      },
    };

    const commitResp = await eacSvc.EaC.Commit(eac, 60);

    const status = await waitForStatus(
      eacSvc,
      commitResp.EnterpriseLookup,
      commitResp.CommitID,
    );

    if (status.Processing == EaCStatusProcessingTypes.COMPLETE) {
      return redirectRequest(
        `/dashboard/enterprises/iot/iot-flow/warm/query?queryLookup=${lookup}`,
        false,
        false,
      );
    } else {
      return redirectRequest(`/dashboard/enterprises/iot/iot-flow/warm/query`, false, false);
    }
  },
};
