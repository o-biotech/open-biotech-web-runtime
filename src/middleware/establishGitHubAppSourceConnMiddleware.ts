import { EaCSourceConnectionDetails } from '@fathym/eac';
import { loadEaCSvc, waitForStatus } from '@fathym/eac/api';
import { UserOAuthConnection } from '@fathym/eac/oauth.ts';
import { EaCRuntimeHandler } from '@fathym/eac/runtime';
import { OpenBiotechWebState } from '../state/OpenBiotechWebState.ts';

export function establishGitHubAppSourceConnMiddleware(
  providerLookup: string,
  oAuthKvLookup: string,
): EaCRuntimeHandler<OpenBiotechWebState> | undefined {
  return async (_req, ctx) => {
    const resp = await ctx.Next();

    if (ctx.Runtime.URLMatch.Path.endsWith('callback')) {
      const provider = ctx.Runtime.EaC.Providers![providerLookup]!;

      const oauthKV = await ctx.Runtime.IoC.Resolve(Deno.Kv, oAuthKvLookup);

      const sessionId = await resp.headers.get('OAUTH_SESSION_ID');

      const currentConn = await oauthKV.get<UserOAuthConnection>([
        'OAuth',
        'User',
        sessionId!,
        providerLookup,
      ]);

      if (currentConn.value) {
        const srcConnLookup = `GITHUB://${currentConn.value.Username}`;

        let srcConnDetails: EaCSourceConnectionDetails;

        if (
          ctx.State.EaC?.SourceConnections &&
          ctx.State.EaC.SourceConnections[srcConnLookup]
        ) {
          srcConnDetails = ctx.State.EaC.SourceConnections[srcConnLookup]!.Details!;
        } else {
          srcConnDetails = {
            Name: `${currentConn.value.Username} GitHub Connection`,
            Description: `The GitHub connection to use for user ${currentConn.value.Username}.`,
          } as EaCSourceConnectionDetails;
        }

        srcConnDetails.ExpiresAt = currentConn.value.ExpiresAt;

        srcConnDetails.RefreshToken = currentConn.value.RefreshToken;

        srcConnDetails.Token = currentConn.value.Token;

        const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

        const commitResp = await eacSvc.Commit(
          {
            EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup!,
            SourceConnections: {
              [srcConnLookup]: {
                Details: srcConnDetails,
                GitHubAppLookup: provider.Details!.AppID,
              },
            },
          },
          60,
        );

        await waitForStatus(
          eacSvc,
          commitResp.EnterpriseLookup,
          commitResp.CommitID,
        );
      }
    }

    return resp;
  };
}
