import { redirectRequest } from '@fathym/common';
import { EaCModuleActuator } from '@fathym/eac';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { EaCStatusProcessingTypes, waitForStatus } from '@fathym/eac/steward/status';
import { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { PageProps } from '@fathym/eac-applications/runtime/preact';
import {
  DisplayStyleTypes,
  EaCManageHandlerForm,
  Hero,
  HeroStyleTypes,
} from '@o-biotech/atomic-design-kit';
import { OpenBiotechWebState } from '@o-biotech/common/state';
import { OpenBiotechEaC } from '@o-biotech/common/utils';
import DeleteAction from '../../../../islands/molecules/DeleteAction.tsx';

export type EaCModuleActuatorsPageData = {
  entLookup: string;

  manageActuator?: EaCModuleActuator;

  manageActuatorLookup?: string;
};

export const handler: EaCRuntimeHandlerSet<
  OpenBiotechWebState,
  EaCModuleActuatorsPageData
> = {
  GET(_, ctx) {
    const manageActuatorLookup = ctx.Params.actuatorLookup;

    let manageActuator: EaCModuleActuator | undefined = undefined;

    if (manageActuatorLookup) {
      manageActuator = ctx.State.EaC!.Actuators![manageActuatorLookup]!;

      if (!manageActuator) {
        return redirectRequest('/enterprises/actuators', false, false);
      }
    }

    const data: EaCModuleActuatorsPageData = {
      entLookup: ctx.State.EaC!.EnterpriseLookup!,
      manageActuator: manageActuator,
      manageActuatorLookup: manageActuatorLookup,
    };

    return ctx.Render(data);
  },

  async POST(req, ctx) {
    const formData = await req.formData();

    const actuatorLookup = formData.get('actuatorLookup') as string;

    const saveEaC: OpenBiotechEaC = {
      EnterpriseLookup: formData.get('entLookup') as string,
      Actuators: {
        [actuatorLookup]: {
          APIPath: formData.get('apiPath') as string,
          Order: Number.parseInt(formData.get('order') as string),
        },
      },
    };

    const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT!);

    const commitResp = await eacSvc.EaC.Commit<OpenBiotechEaC>(saveEaC, 60);

    const status = await waitForStatus(
      eacSvc,
      commitResp.EnterpriseLookup,
      commitResp.CommitID,
    );

    if (status.Processing == EaCStatusProcessingTypes.COMPLETE) {
      return redirectRequest('/enterprises/actuators', false, false);
    } else {
      return redirectRequest(
        `/enterprises/actuators?commitId=${commitResp.CommitID}`,
        false,
        false,
      );
    }
  },

  async DELETE(_req, ctx) {
    const actuatorLookup = ctx.Params.actuatorLookup!;

    const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT!);

    const deleteResp = await eacSvc.EaC.Delete(
      {
        EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup,
        Handlers: {
          [actuatorLookup]: null,
        },
        // deno-lint-ignore no-explicit-any
      } as any,
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

export default function EaCModuleActuators({ Data }: PageProps<EaCModuleActuatorsPageData>) {
  return (
    <>
      <Hero
        title='Manage EaC Handler'
        callToAction='Work with your EaC Handlers to control how your EaC is managed.'
        class='[&_*]:mx-auto [&>*>*]:w-full bg-hero-pattern text-center'
        heroStyle={HeroStyleTypes.None}
        displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      >
      </Hero>

      <EaCManageHandlerForm
        entLookup={Data.entLookup}
        handlerLookup={Data.manageActuatorLookup}
        handlerApiPath={Data.manageActuator?.APIPath}
        handlerOrder={Data.manageActuator?.Order}
      />

      {Data.manageActuatorLookup && (
        <div class='max-w-sm mx-auto mb-4'>
          <DeleteAction
            actionPath={`./handlers/${Data.manageActuatorLookup}`}
            message={`Are you sure you want to delete EaC Handler '${Data.manageActuatorLookup}?`}
          >
            Delete EaC Handler
          </DeleteAction>
        </div>
      )}
    </>
  );
}
