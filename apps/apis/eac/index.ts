import { redirectRequest } from '@fathym/common';
import { EaCCommitResponse } from '@fathym/eac/steward';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { EaCStatusProcessingTypes, waitForStatusWithFreshJwt } from '@fathym/eac/steward/status';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime/pipelines';
import { OpenBiotechEaC } from '@o-biotech/common/utils';
import { OpenBiotechWebState } from '@o-biotech/common/state';

export default {
  GET(_req, ctx) {
    return Response.json(ctx.State.EaC || {});
  },

  async POST(req, ctx) {
    const formData = await req.formData();

    const saveEaC: OpenBiotechEaC = {
      EnterpriseLookup: formData.get('entLookup') as string | undefined,
      Details: {
        Name: formData.get('name') as string,
        Description: formData.get('description') as string,
      },
    };

    const parentEaCSvc = await loadEaCStewardSvc();

    let eacCall: Promise<EaCCommitResponse>;

    if (saveEaC.EnterpriseLookup) {
      const username = ctx.State.Username;

      const jwt = await parentEaCSvc.EaC.JWT(saveEaC.EnterpriseLookup, username);

      const eacSvc = await loadEaCStewardSvc(jwt.Token);

      eacCall = eacSvc.EaC.Commit<OpenBiotechEaC>(saveEaC, 60);
    } else {
      eacCall = parentEaCSvc.EaC.Create<OpenBiotechEaC>(
        saveEaC,
        ctx.State.Username,
        60,
      );
    }

    const saveResp = await eacCall;

    const status = await waitForStatusWithFreshJwt(
      parentEaCSvc,
      saveResp.EnterpriseLookup,
      saveResp.CommitID,
      ctx.State.Username,
    );

    if (status.Processing == EaCStatusProcessingTypes.COMPLETE) {
      await ctx.State.OBiotechKV.set(
        ['User', ctx.State.Username, 'Current', 'EnterpriseLookup'],
        saveResp.EnterpriseLookup,
      );

      return redirectRequest('/dashboard', false, false);
    } else {
      return redirectRequest(
        `/dashboard?commitId=${saveResp.CommitID}`,
        false,
        false,
      );
    }
  },
} as EaCRuntimeHandlers<OpenBiotechWebState>;
