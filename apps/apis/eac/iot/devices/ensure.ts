import { redirectRequest } from '@fathym/common';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { EaCStatusProcessingTypes, waitForStatus } from '@fathym/eac/steward/status';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenBiotechWebState } from '@o-biotech/common/state';
import { OpenBiotechEaC } from '@o-biotech/common/utils';

export const handler: EaCRuntimeHandlers<OpenBiotechWebState> = {
  async POST(req, ctx) {
    const formData = await req.formData();

    const cloudLookup = formData.get('cloudLookup') as string;

    const resGroupLookup = formData.get('resGroupLookup') as string;

    const iotLookup = formData.get('iotLookup') as string;

    const deviceLookup = formData.get('deviceLookup') as string;

    const isIoTEdge = !!(formData.get('isIoTEdge') as string);

    const eac: OpenBiotechEaC = {
      EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup,
      IoT: {
        [iotLookup]: {
          Details: {
            Name: 'IoT Flow',
            Description: 'Main IoT flow for use in collecting device data.',
          },
          CloudLookup: cloudLookup,
          ResourceGroupLookup: resGroupLookup,
          Devices: {
            [deviceLookup]: {
              Details: {
                Name: deviceLookup,
                Description: deviceLookup,
                IsIoTEdge: isIoTEdge,
              },
            },
          },
        },
      },
    };

    const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT!);

    const commitResp = await eacSvc.EaC.Commit<OpenBiotechEaC>(eac, 60 * 30);

    const status = await waitForStatus(
      eacSvc,
      commitResp.EnterpriseLookup,
      commitResp.CommitID,
    );

    if (status.Processing == EaCStatusProcessingTypes.COMPLETE) {
      return redirectRequest('/dashboard/getting-started/devices', false, false);
    } else {
      return redirectRequest(
        `/dashboard/getting-started/devices?commitId=${commitResp.CommitID}`,
        false,
        false,
      );
    }
  },
};
