import { redirectRequest } from '@fathym/common';
import { EaCIoTAsCode, EaCLicenseStripeDetails } from '@fathym/eac';
import { EaCStatusProcessingTypes, loadEaCSvc } from '@fathym/eac/api';
import { EaCRuntimeHandlerResult, PageProps } from '@fathym/eac/runtime';
import { DisplayStyleTypes, Hero, HeroStyleTypes } from '@o-biotech/atomic';
import { setupEaCIoTFlow } from '../../../../../src/eac/setupEaCIoTFlow.ts';
import { OpenBiotechEaC } from '../../../../../src/eac/OpenBiotechEaC.ts';
import ResourceGroupIoTSettings from '../../../../islands/organisms/cloud/iot/res-group-iot-settings.tsx';
import { OpenBiotechWebState } from '../../../../../src/state/OpenBiotechWebState.ts';

export type EaCIoTSettingsPageData = {
  deviceKeys: Record<string, string>;

  entLookup: string;

  hasGitHubAuth: boolean;

  hasStorageCold?: boolean;

  hasStorageHot?: boolean;

  hasStorageWarm?: boolean;

  iotHubKeys: Record<string, string>;

  manageCloudLookup: string;

  manageResourceGroupLookup: string;

  organizationOptions: string[];
  // resGroupOptions: DataLookup[];

  stripePublishableKey: string;
};

export const handler: EaCRuntimeHandlerResult<
  OpenBiotechWebState,
  EaCIoTSettingsPageData
> = {
  async GET(_, ctx) {
    const manageIoTLookup = ctx.Params.iotLookup!;

    const manageIoT: EaCIoTAsCode = ctx.State.EaC!.IoT![manageIoTLookup]!;

    const licDetails = ctx.Runtime.EaC.Licenses!['o-biotech']
      .Details as EaCLicenseStripeDetails;

    const data: EaCIoTSettingsPageData = {
      deviceKeys: {},
      entLookup: ctx.State.EaC!.EnterpriseLookup!,
      hasGitHubAuth: !!ctx.State.GitHub,
      hasStorageCold: !!ctx.State.Cloud.Storage?.Cold,
      hasStorageHot: !!ctx.State.Cloud.Storage?.Hot,
      hasStorageWarm: !!ctx.State.Cloud.Storage?.Warm,
      iotHubKeys: {},
      manageCloudLookup: manageIoT.CloudLookup!,
      manageResourceGroupLookup: manageIoT.ResourceGroupLookup!,
      organizationOptions: [],
      // resGroupOptions: [],
      stripePublishableKey: licDetails.PublishableKey,
    };

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const connsReq: OpenBiotechEaC = {
      EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup!,
      Clouds: {
        [data.manageCloudLookup]: {
          ResourceGroups: {
            [data.manageResourceGroupLookup!]: {
              Resources: {
                ['iot-flow']: {
                  Resources: {},
                },
              },
            },
          },
        },
      },
      IoT: {
        [manageIoTLookup]: {
          Devices: {},
        },
      },
    };

    if (ctx.State.GitHub && ctx.State.EaC!.SourceConnections) {
      const sourceKey = `GITHUB://${ctx.State.GitHub!.Username}`;

      if (ctx.State.EaC!.SourceConnections![sourceKey]) {
        connsReq.SourceConnections = {
          [sourceKey]: {},
        };
      }
    }

    const eacConnections = await eacSvc.Connections(connsReq);

    if (eacConnections.SourceConnections) {
      const sourceKey = `GITHUB://${ctx.State.GitHub!.Username}`;

      data.organizationOptions = Object.keys(
        eacConnections.SourceConnections[sourceKey].Organizations || {},
      );
    }

    const iotFlowConnsResource = eacConnections.Clouds![data.manageCloudLookup].ResourceGroups![
      data.manageResourceGroupLookup!
    ].Resources!['iot-flow'];

    const resKeys = iotFlowConnsResource.Keys as Record<string, unknown>;

    const shortName = data
      .manageResourceGroupLookup!.split('-')
      .map((p) => p.charAt(0))
      .join('');

    data.iotHubKeys = resKeys[
      `Microsoft.Devices/IotHubs/${shortName}-iot-hub`
    ] as Record<string, string>;

    const deviceLookups = Object.keys(
      eacConnections.IoT![manageIoTLookup].Devices || {},
    );

    data.deviceKeys = deviceLookups.reduce((prev, deviceLookup) => {
      const keys = eacConnections.IoT![manageIoTLookup].Devices![deviceLookup]
        .Keys as Record<string, string>;

      prev[deviceLookup] = keys.primaryKey;

      return prev;
    }, {} as Record<string, string>);

    return ctx.Render(data);
  },

  async POST(req, ctx) {
    const formData = await req.formData();

    const cloudLookup = formData.get('cloudLookup') as string;

    const resGroupLookup = formData.get('resGroupLookup') as string;

    const resLookup = (formData.get('resLookup') as string) || `iot-flow`;

    const storageFlowCold = !!(formData.get('storageFlowCold') as string);

    const storageFlowWarm = !!(formData.get('storageFlowWarm') as string);

    const storageFlowHot = !!(formData.get('storageFlowHot') as string);

    const gitHubOrg = formData.get('gitHubOrg') as string;

    const gitHubRepo = formData.get('gitHubRepo') as string;

    const gitHubUsername = ctx.State.GitHub?.Username!;

    const saveEaC = setupEaCIoTFlow(
      ctx.State.EaC!.EnterpriseLookup!,
      ctx.State.EaC!.Clouds!,
      cloudLookup,
      resGroupLookup,
      resLookup,
      storageFlowCold,
      storageFlowWarm,
      storageFlowHot,
      gitHubOrg,
      gitHubRepo,
      gitHubUsername,
    );

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const commitResp = await eacSvc.Commit<OpenBiotechEaC>(saveEaC, 60);

    const status = await eacSvc.Status(
      commitResp.EnterpriseLookup,
      commitResp.CommitID,
    );

    if (
      status.Processing == EaCStatusProcessingTypes.PROCESSING ||
      status.Processing == EaCStatusProcessingTypes.QUEUED
    ) {
      return redirectRequest(
        `/dashboard/commit/${commitResp.CommitID}/status?successRedirect=/enterprises/iot/${resLookup}/settings&errorRedirect=/enterprises/iot/${resLookup}/settings`,
        false,
        false,
      );
    } else {
      return redirectRequest(
        `/dashboard/enterprises/iot/${cloudLookup}/settings?commitId=${commitResp.CommitID}`,
        false,
        false,
      );
    }
  },
};

export default function EaCIoTSettings({
  Data,
}: PageProps<EaCIoTSettingsPageData>) {
  return (
    <>
      <Hero
        title='Manage EaC IoT Settings'
        callToAction='Determine the infrastructure to deploy to your IoT cloud resource groups.'
        class='[&_*]:mx-auto [&>*>*]:w-full bg-hero-pattern text-center'
        heroStyle={HeroStyleTypes.None}
        displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      >
      </Hero>

      <div class='max-w-sm mx-auto mb-4'>
        <ResourceGroupIoTSettings
          cloudLookup={Data.manageCloudLookup}
          deviceKeys={Data.deviceKeys}
          hasGitHubAuth={Data.hasGitHubAuth}
          hasStorageCold={Data!.hasStorageCold}
          hasStorageHot={Data!.hasStorageHot}
          hasStorageWarm={Data!.hasStorageWarm}
          iotHubKeys={Data.iotHubKeys}
          organizations={Data.organizationOptions}
          resGroupLookup={Data.manageResourceGroupLookup}
          stripePublishableKey={Data.stripePublishableKey}
        />
      </div>
    </>
  );
}
