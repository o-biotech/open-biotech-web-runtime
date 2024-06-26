import { redirectRequest } from '@fathym/common';
import { EaCIoTAsCode } from '@fathym/eac';
import { EaCStatusProcessingTypes, loadEaCSvc, waitForStatus } from '@fathym/eac/api';
import { EaCRuntimeHandlerResult, PageProps } from '@fathym/eac/runtime';
import {
  DataLookup,
  DisplayStyleTypes,
  EaCManageIoTForm,
  Hero,
  HeroStyleTypes,
} from '@o-biotech/atomic';
import { OpenBiotechWebState } from '../../../../../src/state/OpenBiotechWebState.ts';
import { OpenBiotechEaC } from '../../../../../src/eac/OpenBiotechEaC.ts';
import DeleteAction from '../../../../islands/molecules/DeleteAction.tsx';

export type EaCIoTPageData = {
  cloudOptions: DataLookup[];

  entLookup: string;

  resGroupOptions: {
    [cloudLookup: string]: DataLookup[];
  };

  manageIoT?: EaCIoTAsCode;

  manageIoTLookup?: string;
};

export const handler: EaCRuntimeHandlerResult<
  OpenBiotechWebState,
  EaCIoTPageData
> = {
  GET(_, ctx) {
    const manageIoTLookup = ctx.Params.iotLookup;

    let manageIoT: EaCIoTAsCode | undefined = undefined;

    if (manageIoTLookup) {
      manageIoT = ctx.State.EaC!.IoT![manageIoTLookup]!;

      if (!manageIoT) {
        return redirectRequest('/enterprises/iot', false, false);
      }
    }

    const data: EaCIoTPageData = {
      cloudOptions: [],
      entLookup: ctx.State.EaC!.EnterpriseLookup!,
      resGroupOptions: {},
      manageIoT: manageIoT,
      manageIoTLookup: manageIoTLookup,
    };

    for (const cloudLookup in ctx.State.EaC!.Clouds) {
      const cloud = ctx.State.EaC!.Clouds![cloudLookup];

      data.cloudOptions.push({
        Lookup: cloudLookup,
        Name: cloud.Details!.Name!,
      });

      data.resGroupOptions[cloudLookup] = [];

      for (const resGroupLookup in cloud.ResourceGroups) {
        const resGroup = cloud.ResourceGroups![resGroupLookup];

        data.resGroupOptions[cloudLookup].push({
          Lookup: resGroupLookup,
          Name: resGroup.Details!.Name!,
        });
      }
    }

    return ctx.Render(data);
  },

  async POST(req, ctx) {
    const formData = await req.formData();

    const iotLookup = formData.get('iotLookup') as string;

    const saveEaC: OpenBiotechEaC = {
      EnterpriseLookup: formData.get('entLookup') as string,
      IoT: {
        [iotLookup]: {
          Details: {
            Name: formData.get('name') as string,
            Description: formData.get('description') as string,
          },
          CloudLookup: formData.get('cloudLookup') as string,
          ResourceGroupLookup: formData.get('resGroupLookup') as string,
        },
      },
    };

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const commitResp = await eacSvc.Commit<OpenBiotechEaC>(saveEaC, 60);

    const status = await waitForStatus(
      eacSvc,
      commitResp.EnterpriseLookup,
      commitResp.CommitID,
    );

    if (status.Processing == EaCStatusProcessingTypes.COMPLETE) {
      return redirectRequest('/enterprises/iot', false, false);
    } else {
      return redirectRequest(
        `/enterprises/iot?commitId=${commitResp.CommitID}`,
        false,
        false,
      );
    }
  },

  async DELETE(_req, ctx) {
    const iotLookup = ctx.Params.iotLookup!;

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const deleteResp = await eacSvc.Delete(
      {
        EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup,
        IoT: {
          [iotLookup]: null,
        },
      },
      false,
      60,
    );

    const status = await waitForStatus(
      eacSvc,
      deleteResp.EnterpriseLookup!,
      deleteResp.CommitID,
    );

    return Response.json(status);
  },
};

export default function EaCIoT({ Data }: PageProps<EaCIoTPageData>) {
  return (
    <>
      <Hero
        title='Manage EaC IoT'
        callToAction='Configure reusable secrets to use in your system, where values are stored in a secure key vault.'
        class='[&_*]:mx-auto [&>*>*]:w-full bg-hero-pattern text-center'
        heroStyle={HeroStyleTypes.None}
        displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      >
      </Hero>

      <EaCManageIoTForm
        entLookup={Data.entLookup}
        iotLookup={Data.manageIoTLookup || ''}
        iotName={Data.manageIoT?.Details?.Name || ''}
        iotDescription={Data.manageIoT?.Details?.Description || ''}
        iotCloudLookup={Data.manageIoT?.CloudLookup || ''}
        iotResGroupLookup={Data.manageIoT?.ResourceGroupLookup || ''}
        cloudOptions={Data.cloudOptions}
        resGroupOptions={Data.resGroupOptions}
      />

      {Data.manageIoTLookup && (
        <div class='max-w-sm mx-auto mb-4'>
          <DeleteAction
            actionPath={`./iot/${Data.manageIoTLookup}`}
            message={`Are you sure you want to delete EaC IoT '${Data.manageIoTLookup}?`}
          >
            Delete EaC IoT
          </DeleteAction>
        </div>
      )}
    </>
  );
}
