import { ModifierHandlerResolver } from '@fathym/eac-applications/runtime/modifiers';
import { establishGitHubAppSourceConnMiddleware } from '../middleware/establishGitHubAppSourceConnMiddleware.ts';
import {
  GitHubAppSourceConnectionModifierDetails,
  isGitHubAppSourceConnectionModifierDetails,
} from './GitHubAppSourceConnectionModifierDetails.ts';
import { EaCRuntimeHandler } from '@fathym/eac/runtime/pipelines';

export const GitHubAppSourceConnectionModifierHandlerResolver: ModifierHandlerResolver = {
  Resolve(_ioc, modifier) {
    if (!isGitHubAppSourceConnectionModifierDetails(modifier.Details)) {
      throw new Deno.errors.NotSupported(
        'The provided modifier is not supported for the GitHubAppSourceConnectionModifierHandlerResolver.',
      );
    }

    const details = modifier.Details as GitHubAppSourceConnectionModifierDetails;

    return Promise.resolve(
      establishGitHubAppSourceConnMiddleware(details.ProviderLookup, details.OAuthDatabaseLookup) as
        | EaCRuntimeHandler
        | undefined,
    );
  },
};
