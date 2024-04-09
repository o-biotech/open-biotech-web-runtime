import { mergeWithArrays, redirectRequest } from '@fathym/common';
import { EaCServiceDefinitions, loadEaCAzureSvc, loadEaCSvc } from '@fathym/eac/api';
import { EaCRuntimeHandlerResult, PageProps } from '@fathym/eac/runtime';
import { Location, Subscription } from 'npm:@azure/arm-subscriptions';
import CloudConnectHero from '../../../components/organisms/heros/CloudConnectHero.tsx';
import CloudStepsFeatures from '../../../components/organisms/cloud/CloudStepsFeatures.tsx';
import { CloudPhaseTypes } from '../../../../src/state/CloudPhaseTypes.ts';
import { OpenBiotechEaC } from '../../../../src/eac/OpenBiotechEaC.ts';
import { OpenBiotechWebState } from '../../../../src/state/OpenBiotechWebState.ts';

interface CloudPageData {
  cloudLookup?: string;

  cloudPhase: CloudPhaseTypes;

  hasGitHubAuth: boolean;

  isConnected: boolean;

  locations: Location[];

  organizations?: string[];

  resGroupLookup?: string;

  subs: Subscription[];
}

export const handler: EaCRuntimeHandlerResult<
  OpenBiotechWebState,
  CloudPageData
> = {
  GET: async (_req, ctx) => {
    if (!ctx.State.EaC) {
      return redirectRequest('/', false, false);
    }

    const data: CloudPageData = {
      cloudLookup: ctx.State.Cloud.CloudLookup,
      cloudPhase: ctx.State.Cloud.Phase,
      hasGitHubAuth: !!ctx.State.GitHub,
      isConnected: ctx.State.Cloud.IsConnected,
      resGroupLookup: ctx.State.Cloud.ResourceGroupLookup,
      locations: [],
      subs: [],
    };

    const svcCalls: (() => Promise<void>)[] = [];

    if (data.cloudLookup) {
      const serviceFiles = [
        'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/services.jsonc',
        'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/api/services.jsonc',
        'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/cold/services.jsonc',
        'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/hot/services.jsonc',
        'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/warm/services.jsonc',
      ];

      const svcFileCalls: Promise<EaCServiceDefinitions>[] = serviceFiles.map(
        (sf) => {
          return new Promise((resolve, reject) => {
            fetch(sf).then((fileResp) => {
              fileResp.json().then((response) => {
                resolve(response);
              });
            });
          });
        },
      );

      svcCalls.push(async () => {
        const svcDefs = await Promise.all<EaCServiceDefinitions>(svcFileCalls);

        const svcDef = mergeWithArrays<EaCServiceDefinitions>(...svcDefs);

        const eacAzureSvc = await loadEaCAzureSvc(ctx.State.EaCJWT!);

        const locationsResp = await eacAzureSvc.CloudLocations(
          ctx.State.EaC!.EnterpriseLookup!,
          data.cloudLookup!,
          svcDef,
        );

        await eacAzureSvc.CloudEnsureProviders(
          ctx.State.EaC!.EnterpriseLookup!,
          data.cloudLookup!,
          svcDef,
        );

        data.locations = locationsResp.Locations;
      });
    }

    if (ctx.State.GitHub && ctx.State.EaC!.SourceConnections) {
      svcCalls.push(async () => {
        const sourceKey = `GITHUB://${ctx.State.GitHub!.Username}`;

        if (ctx.State.EaC!.SourceConnections![sourceKey]) {
          const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

          const eacConnections = await eacSvc.Connections<OpenBiotechEaC>({
            EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup!,
            SourceConnections: {
              [sourceKey]: {},
            },
          });

          if (eacConnections.SourceConnections) {
            data.organizations = Object.keys(
              eacConnections.SourceConnections[sourceKey].Organizations || {},
            );
          }
        }
      });
    }

    await await Promise.all(
      svcCalls.map(async (sc) => {
        await sc();
      }),
    );

    return ctx.Render(data);
  },
};

export default function Cloud({ Data }: PageProps<CloudPageData>) {
  return (
    <div>
      <CloudConnectHero hideAction />

      <CloudStepsFeatures
        cloudLookup={Data!.cloudLookup}
        cloudPhase={Data!.cloudPhase}
        locations={Data!.locations}
        hasGitHubAuth={Data!.hasGitHubAuth}
        organizations={Data!.organizations}
        resGroupLookup={Data!.resGroupLookup}
        subs={Data!.subs}
      />
    </div>
  );
}
