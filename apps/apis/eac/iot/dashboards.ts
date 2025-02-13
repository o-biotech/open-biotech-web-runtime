import { redirectRequest } from '@fathym/common';
import { EaCDashboardAsCode, EaCIoTAsCode } from '@fathym/eac-iot';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { EaCStatusProcessingTypes, waitForStatus } from '@fathym/eac/steward/status';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenBiotechWebState } from '@o-biotech/common/state';
import { OpenBiotechEaC } from '@o-biotech/common/utils';

export const handler: EaCRuntimeHandlers<OpenBiotechWebState> = {
  async POST(req, ctx) {
    const formData = await req.formData();

    const iotLookup = formData.get('iotLookup') as string;

    const dataExplorer = !!(formData.get('dataExplorer') as string);

    // const fathymDataDashboard =
    //   !!(formData.get("fathymDataDashboard") as string);

    const freeboard = !!(formData.get('freeboard') as string);

    const iotDashboards: {
      [key: string]: EaCDashboardAsCode;
    } = {};

    if (dataExplorer) {
      iotDashboards[`azure-data-explorer`] = {
        Details: {
          Name: 'Azure Data Explorer',
          Description: 'The embeded instance of azure data explorer.',
          Type: 'AzureDataExplorer',
        },
      };
    }

    if (freeboard) {
      iotDashboards[`freeboard`] = {
        Details: {
          Name: 'Freeboard',
          Description: 'The embeded instance of freeboard.',
          Type: 'Freeboard',
        },
      };
    }

    const eac: OpenBiotechEaC = {
      EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup,
      IoT: {
        [iotLookup]: {
          Dashboards: iotDashboards,
        } as EaCIoTAsCode,
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
      return redirectRequest(`/dashboard`, false, false);
    } else {
      return redirectRequest(
        `/dashboard/getting-started/devices?commitId=${commitResp.CommitID}`,
        false,
        false,
      );
    }
  },
};
