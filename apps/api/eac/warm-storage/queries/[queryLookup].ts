import { redirectRequest } from '@fathym/common';
import { loadEaCSvc } from '@fathym/eac/api';
import { waitForStatus } from '@fathym/eac/api';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime';
import { OpenBiotechWebState } from '../../../../../src/state/OpenBiotechWebState.ts';
import { EverythingAsCode } from '@fathym/eac';

export const handler: EaCRuntimeHandlers<OpenBiotechWebState> = {
    async DELETE(req, ctx) {
        const eac: EverythingAsCode = await req.json();

        const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

        const deleteResp = await eacSvc.Delete(eac,
            false,
            60,
          );

        await waitForStatus(
            eacSvc,
            deleteResp.EnterpriseLookup,
            deleteResp.CommitID,
        );

        return redirectRequest(`/dashboard/enterprises/iot/iot-flow/warm/query`, false, false);
    },
};
