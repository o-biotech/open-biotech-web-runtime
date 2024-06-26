import { redirectRequest } from '@fathym/common';
import { EaCDeviceAsCode } from '@fathym/eac';
import { EaCStatusProcessingTypes, loadEaCSvc, waitForStatus } from '@fathym/eac/api';
import { EaCRuntimeHandlerResult, PageProps } from '@fathym/eac/runtime';
import { DisplayStyleTypes, EaCManageIoTDeviceForm, Hero, HeroStyleTypes } from '@o-biotech/atomic';
import { OpenBiotechWebState } from '../../../../../../../src/state/OpenBiotechWebState.ts';
import { OpenBiotechEaC } from '../../../../../../../src/eac/OpenBiotechEaC.ts';

export type EaCIoTDevicePageData = {
  entLookup: string;

  iotLookup: string;

  manageDevice?: EaCDeviceAsCode;

  manageDeviceLookup?: string;
};

export const handler: EaCRuntimeHandlerResult<
  OpenBiotechWebState,
  EaCIoTDevicePageData
> = {
  GET(_, ctx) {
    const iotLookup = ctx.Params.iotLookup!;

    const manageDeviceLookup = ctx.Params.deviceLookup;

    let manageDevice: EaCDeviceAsCode | undefined = undefined;

    if (manageDeviceLookup) {
      manageDevice = ctx.State.EaC!.IoT![iotLookup]!.Devices![manageDeviceLookup]!;

      if (!manageDevice) {
        return redirectRequest(`/enterprises/iot/${iotLookup}/devices`, false, false);
      }
    }

    const data: EaCIoTDevicePageData = {
      entLookup: ctx.State.EaC!.EnterpriseLookup!,
      iotLookup: iotLookup,
      manageDevice: manageDevice,
      manageDeviceLookup: manageDeviceLookup,
    };

    return ctx.Render(data);
  },

  async POST(req, ctx) {
    const formData = await req.formData();

    const iotLookup = formData.get('iotLookup') as string;

    const deviceLookup = formData.get('deviceLookup') as string;

    const saveEaC: OpenBiotechEaC = {
      EnterpriseLookup: formData.get('entLookup') as string,
      IoT: {
        [iotLookup]: {
          Devices: {
            [deviceLookup]: {
              Details: {
                Name: formData.get('name') as string,
                Description: formData.get('description') as string,
                IsIoTEdge: !!(formData.get('isIoTEdge') as string),
              },
            },
          },
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
      return redirectRequest(`/enterprises/iot/${iotLookup}/devices`, false, false);
    } else {
      return redirectRequest(
        `/enterprises/iot/${iotLookup}/devices?commitId=${commitResp.CommitID}`,
        false,
        false,
      );
    }
  },

  async DELETE(_req, ctx) {
    const iotLookup = ctx.Params.iotLookup!;

    const deviceLookup = ctx.Params.deviceLookup!;

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const deleteResp = await eacSvc.Delete(
      {
        EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup,
        IoT: {
          [iotLookup]: {
            Devices: {
              [deviceLookup]: null,
            },
          },
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

export default function EaCIoTDevice({
  Data,
}: PageProps<EaCIoTDevicePageData>) {
  return (
    <>
      <Hero
        title='Manage EaC IoT Device'
        callToAction='Create IoT devices to connect your edge to the cloud.'
        class='[&_*]:mx-auto [&>*>*]:w-full bg-hero-pattern text-center'
        heroStyle={HeroStyleTypes.None}
        displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      >
      </Hero>

      <EaCManageIoTDeviceForm
        entLookup={Data.entLookup}
        iotLookup={Data.iotLookup || ''}
        deviceLookup={Data.manageDeviceLookup || ''}
        deviceName={Data.manageDevice?.Details?.Name || ''}
        deviceDescription={Data.manageDevice?.Details?.Description || ''}
        deviceIsIoTEdge={Data.manageDevice?.Details?.IsIoTEdge || false}
      />

      {
        /* {Data.manageDeviceLookup && (
        <div class='max-w-sm mx-auto mb-4'>
          <DeleteAction
            actionPath={`./iot/devices/${Data.manageDeviceLookup}`}
            message={`Are you sure you want to delete EaC IoT Device '${Data.manageDeviceLookup}?`}
          >
            Delete EaC IoT Device
          </DeleteAction>
        </div>
      )} */
      }
    </>
  );
}
