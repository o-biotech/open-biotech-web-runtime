import { redirectRequest } from '@fathym/common';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { waitForStatus } from '@fathym/eac/steward/status';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenBiotechWebState } from '@o-biotech/common/state';
import { EverythingAsCode } from '@fathym/eac';

export const handler: EaCRuntimeHandlers<OpenBiotechWebState> = {
  async DELETE(req, ctx) {
    const eac: EverythingAsCode = await req.json();

    const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT!);

    // deno-lint-ignore no-explicit-any
    const deleteResp = await eacSvc.EaC.Delete(eac as any, false, 60);

    await waitForStatus(
      eacSvc,
      deleteResp.EnterpriseLookup,
      deleteResp.CommitID,
    );

    return redirectRequest(`/dashboard/enterprises/iot/iot-flow/warm/query`, false, false);
  },
};
