import { redirectRequest } from '@fathym/common';
import { EaCHandler } from '@fathym/eac';
import { EaCStatusProcessingTypes, loadEaCSvc, waitForStatus } from '@fathym/eac/api';
import { EaCRuntimeHandlerResult, PageProps } from '@fathym/eac/runtime';
import { DisplayStyleTypes, EaCManageHandlerForm, Hero, HeroStyleTypes } from '@o-biotech/atomic';
import { OpenBiotechWebState } from '../../../../../src/state/OpenBiotechWebState.ts';
import { OpenBiotechEaC } from '../../../../../src/eac/OpenBiotechEaC.ts';
import DeleteAction from '../../../../islands/molecules/DeleteAction.tsx';

export type EaCHandlersPageData = {
  entLookup: string;

  manageHandler?: EaCHandler;

  manageHandlerLookup?: string;
};

export const handler: EaCRuntimeHandlerResult<
  OpenBiotechWebState,
  EaCHandlersPageData
> = {
  GET(_, ctx) {
    const manageHandlerLookup = ctx.Params.handlerLookup;

    let manageHandler: EaCHandler | undefined = undefined;

    if (manageHandlerLookup) {
      manageHandler = ctx.State.EaC!.Handlers![manageHandlerLookup]!;

      if (!manageHandler) {
        return redirectRequest('/enterprises/handlers', false, false);
      }
    }

    const data: EaCHandlersPageData = {
      entLookup: ctx.State.EaC!.EnterpriseLookup!,
      manageHandler: manageHandler,
      manageHandlerLookup: manageHandlerLookup,
    };

    return ctx.Render(data);
  },

  async POST(req, ctx) {
    const formData = await req.formData();

    const handlerLookup = formData.get('handlerLookup') as string;

    const saveEaC: OpenBiotechEaC = {
      EnterpriseLookup: formData.get('entLookup') as string,
      Handlers: {
        [handlerLookup]: {
          APIPath: formData.get('apiPath') as string,
          Order: Number.parseInt(formData.get('order') as string),
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
      return redirectRequest('/enterprises/handlers', false, false);
    } else {
      return redirectRequest(
        `/enterprises/handlers?commitId=${commitResp.CommitID}`,
        false,
        false,
      );
    }
  },

  async DELETE(_req, ctx) {
    const handlerLookup = ctx.Params.handlerLookup!;

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const deleteResp = await eacSvc.Delete(
      {
        EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup,
        Handlers: {
          [handlerLookup]: null,
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

export default function EaCHandlers({ Data }: PageProps<EaCHandlersPageData>) {
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
        handlerLookup={Data.manageHandlerLookup}
        handlerApiPath={Data.manageHandler?.APIPath}
        handlerOrder={Data.manageHandler?.Order}
      />

      {Data.manageHandlerLookup && (
        <div class='max-w-sm mx-auto mb-4'>
          <DeleteAction
            actionPath={`./handlers/${Data.manageHandlerLookup}`}
            message={`Are you sure you want to delete EaC Handler '${Data.manageHandlerLookup}?`}
          >
            Delete EaC Handler
          </DeleteAction>
        </div>
      )}
    </>
  );
}
