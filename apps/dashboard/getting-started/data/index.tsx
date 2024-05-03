import { redirectRequest } from '@fathym/common';
import { loadEaCSvc } from '@fathym/eac/api';
import { EaCRuntimeHandlerResult, PageProps } from '@fathym/eac/runtime';
import {
  Action,
  ActionGroup,
  classSet,
  DisplayStyleTypes,
  Hero,
  HeroStyleTypes,
} from '@o-biotech/atomic';
import { DataStepsFeatures } from '../../../components/organisms/features/DataStepsFeatures.tsx';
import { DataPhaseTypes } from '../../../../src/state/DataPhaseTypes.ts';
import { OpenBiotechEaC } from '../../../../src/eac/OpenBiotechEaC.ts';
import { OpenBiotechWebState } from '../../../../src/state/OpenBiotechWebState.ts';
import DeviceDataFlowing from '../../../islands/organisms/iot/device-data-flowing.tsx';
import { callToActionStyles } from '../../../components/styles/actions.tsx';

interface DataPageData {
  dashboardTypes: string[];

  dataPhase: DataPhaseTypes;

  deviceKeys: Record<string, string>;

  iotHubKeys: Record<string, string>;

  jwt: string;

  kustoCluster: string;

  kustoLocation: string;

  resGroupLookup: string;
}

export const handler: EaCRuntimeHandlerResult<
  OpenBiotechWebState,
  DataPageData
> = {
  GET: async (_req, ctx) => {
    if (ctx.State.Phase < 2) {
      return redirectRequest('/', false, false);
    }

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const eacConnections = await eacSvc.Connections<OpenBiotechEaC>({
      EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup!,
      Clouds: {
        [ctx.State.Cloud.CloudLookup!]: {
          ResourceGroups: {
            [ctx.State.Cloud.ResourceGroupLookup!]: {
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
        ['iot-flow']: {
          Devices: {},
        },
      },
    });

    const iotFlowResource = eacConnections.Clouds![ctx.State.Cloud.CloudLookup!].ResourceGroups![
      ctx.State.Cloud.ResourceGroupLookup!
    ].Resources!['iot-flow'];

    const resKeys = iotFlowResource.Keys as Record<string, unknown>;

    const shortName = ctx.State.Cloud.ResourceGroupLookup!.split('-')
      .map((p) => p.charAt(0))
      .join('');

    const iotHubKeys = resKeys[
      `Microsoft.Devices/IotHubs/${shortName}-iot-hub`
    ] as Record<string, string>;

    const deviceLookups = Object.keys(
      eacConnections.IoT!['iot-flow'].Devices || {},
    );

    const deviceKeys = deviceLookups.reduce((prev, deviceLookup) => {
      const keys = eacConnections.IoT!['iot-flow'].Devices![deviceLookup]
        .Keys as Record<string, string>;

      prev[deviceLookup] = keys.primaryKey;

      return prev;
    }, {} as Record<string, string>);

    const resLocations = iotFlowResource.Resources!['iot-flow-warm']
      .Locations as Record<string, string>;

    const kustoCluster = `${shortName}-data-explorer`;

    const kustoLocation = resLocations[`Microsoft.Kusto/clusters/${kustoCluster}`];

    const dashboardLookups = Object.keys(
      ctx.State.EaC!.IoT!['iot-flow'].Dashboards || {},
    );

    const dashboardTypes = dashboardLookups.map((dashboardLookup) => {
      const dashboard = ctx.State.EaC!.IoT!['iot-flow'].Dashboards![dashboardLookup];

      return dashboard.Details!.Type!;
    });

    const data: DataPageData = {
      dashboardTypes: dashboardTypes,
      dataPhase: ctx.State.Data.Phase,
      deviceKeys: deviceKeys,
      iotHubKeys: iotHubKeys,
      jwt: ctx.State.Devices.JWT,
      kustoCluster: kustoCluster,
      kustoLocation: kustoLocation,
      resGroupLookup: ctx.State.Cloud.ResourceGroupLookup!,
    };

    return ctx.Render(data);
  },
};

export default function Data({ Data }: PageProps<DataPageData>) {
  return (
    <div>
      <Hero
        title='Data Flows, Dashboards and APIs'
        callToAction='Get device data flowing, explore through default dashboards and share with downstream analytics, alerts or ML services.'
        class='[&_*]:mx-auto [&>*>*]:w-full bg-hero-pattern text-center'
        heroStyle={HeroStyleTypes.None}
        displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      />

      <DataStepsFeatures
        dashboardTypes={Data!.dashboardTypes}
        dataPhase={Data!.dataPhase}
        deviceKeys={Data!.deviceKeys}
        iotHubKeys={Data!.iotHubKeys}
        jwt={Data!.jwt}
        kustoCluster={Data!.kustoCluster}
        kustoLocation={Data!.kustoLocation}
        resGroupLookup={Data!.resGroupLookup}
      />
    </div>
  );
}
