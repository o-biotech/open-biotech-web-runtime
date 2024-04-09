import { redirectRequest } from '@fathym/common';
import { EaCStatusProcessingTypes, loadEaCSvc } from '@fathym/eac/api';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime';
import { OpenBiotechWebState } from '../../../../src/state/OpenBiotechWebState.ts';
import { OpenBiotechEaC } from '../../../../src/eac/OpenBiotechEaC.ts';
import { setupEaCIoTFlow } from '../../../../src/eac/setupEaCIoTFlow.ts';

export const handler: EaCRuntimeHandlers<OpenBiotechWebState> = {
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

    const eac = setupEaCIoTFlow(
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

    const commitResp = await eacSvc.Commit<OpenBiotechEaC>(eac, 60 * 30);

    // const status = await waitForStatus(
    //   eacSvc,
    //   commitResp.EnterpriseLookup,
    //   commitResp.CommitID,
    // );

    const status = await eacSvc.Status(
      commitResp.EnterpriseLookup,
      commitResp.CommitID,
    );

    if (
      status.Processing == EaCStatusProcessingTypes.PROCESSING ||
      status.Processing == EaCStatusProcessingTypes.QUEUED
    ) {
      return redirectRequest(
        `/dashboard/commit/${commitResp.CommitID}/status?successRedirect=/dashboard&errorRedirect=/dashboard/getting-started/cloud`,
        false,
        false,
      );
    } else {
      return redirectRequest(
        `/dashboard/getting-started/cloud?commitId=${commitResp.CommitID}`,
        false,
        false,
      );
    }
  },
};
