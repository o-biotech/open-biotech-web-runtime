import { respond } from '@fathym/common';
import { EaCGitHubAppProviderDetails } from '@fathym/eac';
import { loadOctokit } from '@fathym/eac/octokit.ts';
import { EaCRuntimeHandlers } from '@fathym/eac/runtime';
import { OpenBiotechWebState } from '../../../../src/state/OpenBiotechWebState.ts';

export const handler: EaCRuntimeHandlers<OpenBiotechWebState> = {
  async GET(_req, ctx) {
    const sourceConn = ctx.State.EaC!.SourceConnections![
      `GITHUB://${ctx.State.GitHub!.Username}`
    ];

    const sourceDetails = sourceConn.Details!;

    const gitHubApp = ctx.State.EaC!.GitHubApps![sourceConn.GitHubAppLookup!];

    const provider = ctx.State.EaC!.Providers![gitHubApp.Details!.ProviderLookup];

    const octokit = await loadOctokit(
      provider.Details as EaCGitHubAppProviderDetails,
      sourceDetails,
    );

    const { data } = await octokit.rest.users.getAuthenticated();

    return respond(data);
  },
};
