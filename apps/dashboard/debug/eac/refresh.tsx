import { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { EverythingAsCode } from '@fathym/eac';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { waitForStatus } from '@fathym/eac/steward/status';
import { redirectRequest } from '@fathym/common';
import { OpenBiotechWebState } from '@o-biotech/common/state';
import { loadEaCActuators } from '../../../../configs/eac-actuators.config.ts';

export const handler: EaCRuntimeHandlerSet<OpenBiotechWebState> = {
  async GET(_req, ctx) {
    const eac: EverythingAsCode = {
      EnterpriseLookup: ctx.State.EaC?.EnterpriseLookup,
      Actuators: loadEaCActuators(),
    };

    const eacSvc = await loadEaCStewardSvc(
      ctx.State.EaC!.EnterpriseLookup!,
      ctx.State.Username!
    );

    const commitResp = await eacSvc.EaC.Commit(eac, 60);

    const _status = await waitForStatus(
      eacSvc,
      commitResp.EnterpriseLookup,
      commitResp.CommitID
    );

    return redirectRequest(ctx.Runtime.URLMatch.Base, false, false);
  },
};
