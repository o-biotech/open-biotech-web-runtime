import { redirectRequest } from '@fathym/common';
import { EaCCloudResourceAsCode, EaCCloudResourceFormatDetails } from '@fathym/eac-azure';
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

    const resLookup = (formData.get('resLookup') as string) || 'data-apis';

    const resGroupLocation = ctx.State.EaC!.Clouds![cloudLookup].ResourceGroups![resGroupLookup]
      .Details!.Location;

    const orgName = ctx.State.EaC!.Details!.Name;

    // const storageFlowHot = !!(formData.get("storageFlowHot") as string);

    const shortName = resGroupLookup
      .split('-')
      .map((p) => p.charAt(0))
      .join('');

    const iotResources: {
      [key: string]: EaCCloudResourceAsCode;
    } = {};

    const eac: OpenBiotechEaC = {
      EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup,
      Clouds: {
        [cloudLookup]: {
          ResourceGroups: {
            [resGroupLookup]: {
              Resources: {
                'iot-flow': {
                  Resources: {
                    [resLookup]: {
                      Details: {
                        Type: 'Format',
                        Name: 'Data APIs',
                        Description: 'The Data APIs to use for the enterprise.',
                        Order: 1,
                        Template: {
                          Content:
                            'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/api/template.jsonc',
                          Parameters:
                            'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/api/parameters.jsonc',
                        },
                        Data: {
                          CloudLookup: cloudLookup,
                          Location: resGroupLocation,
                          Name: resGroupLookup,
                          OrganizationName: orgName,
                          PrincipalID: ctx.State.Username,
                          ResourceLookup: resLookup,
                          ShortName: shortName,
                        },
                        Outputs: {},
                      } as EaCCloudResourceFormatDetails,
                      Resources: iotResources,
                    },
                  },
                },
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
      return redirectRequest(
        '/dashboard/getting-started/devices',
        false,
        false,
      );
    } else {
      return redirectRequest(
        `/dashboard/getting-started/devices?commitId=${commitResp.CommitID}`,
        false,
        false,
      );
    }
  },
};
