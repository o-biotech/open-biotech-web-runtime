import {
  EaCCloudAsCode,
  EaCCloudAzureDetails,
  EaCCloudResourceAsCode,
  EaCCloudResourceFormatDetails,
  EaCCloudRoleAssignment,
} from '@fathym/eac';
import { OpenBiotechEaC } from './OpenBiotechEaC.ts';

export function setupEaCIoTFlow(
  entLookup: string,
  clouds: Record<string, EaCCloudAsCode>,
  cloudLookup: string,
  resGroupLookup: string,
  resLookup: string,
  storageFlowCold: boolean,
  storageFlowWarm: boolean,
  storageFlowHot: boolean,
  gitHubOrg: string,
  gitHubRepo: string,
  gitHubUsername: string,
): OpenBiotechEaC {
  const shortName = resGroupLookup
    .split('-')
    .map((p) => p.charAt(0))
    .join('');

  const iotResources: {
    [key: string]: EaCCloudResourceAsCode;
  } = {};

  const resGroupLocation = clouds![cloudLookup].ResourceGroups![resGroupLookup].Details!.Location;

  const details = clouds![cloudLookup].Details as EaCCloudAzureDetails;

  const servicePrincipalId = details!.ID;

  const roleAssignments: Record<string, EaCCloudRoleAssignment[]> = {};

  if (storageFlowCold) {
    iotResources[`${resLookup}-cold`] = {
      Details: {
        Type: 'Format',
        Name: 'IoT Infrastructure - Cold Flow',
        Description: 'The cold flow IoT Infrastructure to use for the enterprise.',
        Order: 1,
        Template: {
          Content:
            `https://raw.githubusercontent.com/lowcodeunit/infrastructure/integration/templates/o-biotech/iot/ref-arch/cold/template.jsonc`,
          Parameters:
            'https://raw.githubusercontent.com/lowcodeunit/infrastructure/integration/templates/o-biotech/iot/ref-arch/cold/parameters.jsonc',
        },
        Data: {
          CloudLookup: cloudLookup,
          Location: resGroupLocation,
          Name: resGroupLookup,
          ParentResourceLookup: `${resLookup}`,
          ResourceLookup: `${resLookup}-cold`,
          ServicePrincipalID: servicePrincipalId,
          ShortName: shortName,
        },
        Outputs: {},
      } as EaCCloudResourceFormatDetails,
    };

    roleAssignments[details.ID!] = [
      {
        PrincipalID: details.ID!,
        PrincipalType: 'ServicePrincipal',
        RoleDefinitionID: 'b7e6dc6d-f1e8-4753-8033-0f276bb0955b',
        Scope:
          `/subscriptions/${details.SubscriptionID}/resourceGroups/${resGroupLookup}/providers/Microsoft.Storage/storageAccounts/${shortName}datalake`,
        // Scope: '$output:dataLakeRoleScope',
      },
    ];
  }

  if (storageFlowWarm) {
    iotResources[`${resLookup}-warm`] = {
      Details: {
        Type: 'Format',
        Name: 'IoT Infrastructure - Warm Flow',
        Description: 'The warm flow IoT Infrastructure to use for the enterprise.',
        Order: 1,
        Template: {
          Content:
            'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/warm/template.jsonc',
          Parameters:
            'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/warm/parameters.jsonc',
        },
        Data: {
          CloudLookup: cloudLookup,
          Location: resGroupLocation,
          Name: resGroupLookup,
          PrincipalID: '', // TODO(mcgear): Pass in user email (email used to login to OpenBiotech must match one used for Azure)
          ResourceLookup: `${resLookup}-warm`,
          ServicePrincipalID: servicePrincipalId,
          ShortName: shortName,
        },
        Outputs: {},
      } as EaCCloudResourceFormatDetails,
    };
  }

  if (storageFlowHot) {
    iotResources[`${resLookup}-hot`] = {
      Details: {
        Type: 'Format',
        Name: 'IoT Infrastructure - Hot Flow',
        Description: 'The hot flow IoT Infrastructure to use for the enterprise.',
        Order: 1,
        Template: {
          Content:
            'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/hot/template.jsonc',
          Parameters:
            'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/hot/parameters.jsonc',
        },
        Data: {
          Branch: 'main',
          CloudLookup: cloudLookup,
          Location: resGroupLocation,
          Name: resGroupLookup,
          RepositoryURL: 'https://github.com/fathym-deno/iot-ensemble-device-data',
          ResourceLookup: `${resLookup}-hot`,
          ShortName: shortName,
        },
        Outputs: {},
      } as EaCCloudResourceFormatDetails,
    };
  }

  const eac: OpenBiotechEaC = {
    EnterpriseLookup: entLookup,
    Clouds: {
      [cloudLookup]: {
        RoleAssignments: roleAssignments,
        ResourceGroups: {
          [resGroupLookup]: {
            Resources: {
              [resLookup]: {
                Details: {
                  Type: 'Format',
                  Name: 'IoT Infrastructure',
                  Description: 'The IoT Infrastructure to use for the enterprise.',
                  Order: 1,
                  Template: {
                    Content:
                      'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/template.jsonc',
                    Parameters:
                      'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/parameters.jsonc',
                  },
                  Data: {
                    CloudLookup: cloudLookup,
                    Location: resGroupLocation,
                    Name: resGroupLookup,
                    PrincipalID: '', // TODO(mcgear): Pass in actual principal ID (maybe retrievable from MSAL account record? I think can just be the email?)
                    ResourceLookup: resLookup,
                    ServicePrincipalID: servicePrincipalId,
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
    DevOpsActions: {},
    Secrets: {},
    SourceConnections: {},
    Sources: {},
  };

  if (storageFlowHot) {
    const secretLookup = `${shortName}-iot-devices-flow-publish-profile`;

    eac.Secrets![secretLookup] = {
      Details: {
        Name: 'IoT Devices Flow - Publish Profile',
        Description: 'The publish profile to use for deploying the IoT devices flow.',
        Value:
          `$connections:$.eac.Clouds['${cloudLookup}'].ResourceGroups['${resGroupLookup}'].Resources['${resLookup}'].Resources['${resLookup}-hot'].Profiles['Microsoft.Web/sites/${shortName}-iot-devices-flow']['_']`,
      },
      CloudLookup: cloudLookup,
      KeyVaultLookup: `${shortName}-key-vault`,
    };

    const doaLookup = 'azure-function-deploy-nodejs';

    eac.DevOpsActions![doaLookup] = {
      Details: {
        Name: 'Azure Function Deploy - NodeJS',
        Description: 'Automated deployments of NodeJS Azure Functions to Azure Web Apps',
        Path: 'build-and-deploy.yml',
        Templates: [
          'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/github/nodejs/.hbs._header.yml',
          'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/github/nodejs/azure-function-deploy.yml',
        ],
      },
    };

    const iotDeviceFlowArtifactLookup = 'iot-ensemble-device-flow';

    eac.Sources![`template|GITHUB://fathym-deno/iot-ensemble-device-flow`] = {
      Details: {
        Type: 'GITHUB',
        Branches: ['main', 'integration'],
        MainBranch: 'integration',
        Name: 'IoT Ensemble Device Flow',
        Description: 'A hot flow to SignalR for device telemetry',
        Organization: gitHubOrg,
        Repository: gitHubRepo,
        Username: gitHubUsername,
      },
      SecretLookups: {
        AZURE_FUNCTIONAPP_PUBLISH_PROFILE: secretLookup,
      },
      Artifacts: {
        [iotDeviceFlowArtifactLookup]: {
          Details: {
            Name: 'IoT Ensemble Device Flow',
            Description: 'Build & deployment configuration for the IoT Ensemble Device Flow',
          },
          Parameters: {
            FunctionAppName: `${shortName}-iot-devices-flow`,
            // Branches: 'main',
            // PackagePath: '.',
            // NodeVersion: '18.x',
          },
          DevOpsActionTriggerLookup: doaLookup,
        },
      },
    };
  }

  return eac;
}
