import { EaCModifierDetails, isEaCModifierDetails } from '@fathym/eac';

export type GitHubAppSourceConnectionModifierDetails = {
  ProviderLookup: string;

  OAuthDatabaseLookup: string;
} & EaCModifierDetails<'GitHubAppSourceConn'>;

export function isGitHubAppSourceConnectionModifierDetails(
  details: unknown,
): details is GitHubAppSourceConnectionModifierDetails {
  const x = details as GitHubAppSourceConnectionModifierDetails;

  return (
    isEaCModifierDetails('GitHubAppSourceConn', x) &&
    x.ProviderLookup !== undefined &&
    typeof x.ProviderLookup === 'string' &&
    x.OAuthDatabaseLookup !== undefined &&
    typeof x.OAuthDatabaseLookup === 'string'
  );
}
