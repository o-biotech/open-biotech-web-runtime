
import { ProcessorHandlerResolver } from '@fathym/eac-applications/runtime/processors';
import { EverythingAsCodeApplications } from '@fathym/eac-applications';
import { EaCGitHubAppProviderDetails, EverythingAsCodeIdentity, isEaCAzureADB2CProviderDetails, isEaCAzureADProviderDetails, isEaCGitHubAppProviderDetails, isEaCOAuthProviderDetails } from '@fathym/eac-identity';
import { EverythingAsCode } from '@fathym/eac';
import { EaCOAuthProcessor, isEaCOAuthProcessor } from '@fathym/eac-applications/processors';
import { loadOAuth2ClientConfig } from '@fathym/eac-applications/runtime/modules';
import { oAuthRequest, UserOAuthConnection } from '@fathym/common/oauth';
import { djwt } from '@fathym/common';
import { EaCSourceConnectionDetails } from 'jsr:@fathym/eac-sources@0.0.24';
import { loadOctokit } from 'jsr:@fathym/eac-sources@0.0.24/utils';
import * as DenoKVOAuth from "jsr:@deno/kv-oauth@0.11.0";


export const TempGitHubEaCOAuthProcessorHandlerResolver: ProcessorHandlerResolver<
  EverythingAsCode & EverythingAsCodeApplications & EverythingAsCodeIdentity
> = {
  async Resolve(ioc, appProcCfg, eac) {
    if (!isEaCOAuthProcessor(appProcCfg.Application.Processor)) {
      throw new Deno.errors.NotSupported(
        'The provided processor is not supported for the EaCOAuthProcessorHandlerResolver.'
      );
    }

    const processor = appProcCfg.Application.Processor as EaCOAuthProcessor;

    const provider = eac.Providers![processor.ProviderLookup];

    const denoKv = await ioc.Resolve(Deno.Kv, provider.DatabaseLookup);

    const handleCompleteCallback = async (
      loadPrimaryEmail: (accessToken: string) => Promise<string>,
      tokens: DenoKVOAuth.Tokens,
      newSessionId: string,
      oldSessionId?: string,
      isPrimary?: boolean
    ) => {
      const now = Date.now();

      const { accessToken, refreshToken, expiresIn } = tokens;

      const primaryEmail = await loadPrimaryEmail(accessToken);

      const expiresAt = now + expiresIn! * 1000;

      if (isPrimary) {
        await denoKv.set(
          ['OAuth', 'User', newSessionId, 'Current'],
          {
            Username: primaryEmail!,
            ExpiresAt: expiresAt,
            Token: accessToken,
            RefreshToken: refreshToken,
          } as UserOAuthConnection,
          {
            expireIn: expiresIn! * 1000,
          }
        );
      } else {
        const curUser = await denoKv.get([
          'OAuth',
          'User',
          oldSessionId!,
          'Current',
        ]);

        if (curUser.value) {
          await denoKv.set(
            ['OAuth', 'User', newSessionId, 'Current'],
            {
              ...curUser.value,
              ExpiresAt: expiresAt,
            } as UserOAuthConnection,
            {
              expireIn: expiresIn! * 1000,
            }
          );
        }
      }

      await denoKv.set(
        ['OAuth', 'User', newSessionId, processor.ProviderLookup],
        {
          Username: primaryEmail!,
          ExpiresAt: expiresAt,
          Token: accessToken,
          RefreshToken: refreshToken,
        } as UserOAuthConnection,
        {
          expireIn: expiresIn! * 1000,
        }
      );

      if (oldSessionId) {
        await denoKv
          .atomic()
          .delete(['OAuth', 'User', oldSessionId, 'Current'])
          .delete(['OAuth', 'User', oldSessionId, processor.ProviderLookup])
          .commit();
      }
    };

    const oAuthConfig = loadOAuth2ClientConfig(provider)!;

    return (req, ctx) => {
      const base = ctx.Runtime.URLMatch.FromBase('./').href;

      if (isEaCAzureADB2CProviderDetails(provider.Details)) {
        return oAuthRequest(
          req,
          oAuthConfig,
          async (tokens, newSessionId, oldSessionId) => {
            await handleCompleteCallback(
              async (accessToken) => {
                const [_header, payload, _signature] = await djwt.decode(
                  accessToken
                );

                return (payload as Record<string, string>).emails[0];
              },
              tokens,
              newSessionId,
              oldSessionId,
              provider.Details?.IsPrimary
            );
          },
          base,
          ctx.Runtime.URLMatch.Path
        );
      } else if (isEaCAzureADProviderDetails(provider.Details)) {
        if (ctx.Runtime.URLMatch.Path.endsWith('callback')) {
          const url = new URL(req.url);

          oAuthConfig.redirectUri = new URL(url.pathname, url.origin).href;
        }

        return oAuthRequest(
          req,
          oAuthConfig,
          async (tokens, newSessionId, oldSessionId) => {
            await handleCompleteCallback(
              async (accessToken) => {
                const [_header, payload, _signature] = await djwt.decode(
                  accessToken
                );

                return (payload as Record<string, string>).upn;
              },
              tokens,
              newSessionId,
              oldSessionId,
              provider.Details?.IsPrimary
            );
          },
          base,
          ctx.Runtime.URLMatch.Path
        );
      } else if (isEaCGitHubAppProviderDetails(provider.Details)) {
        return oAuthRequest(
          req,
          oAuthConfig,
          async (tokens, newSessionId, oldSessionId) => {
            await handleCompleteCallback(
              async (accessToken) => {
                const octokit = await loadOctokit(
                  provider.Details as EaCGitHubAppProviderDetails,
                  {
                    Token: accessToken,
                  } as EaCSourceConnectionDetails
                );

                const {
                  data: { login },
                } = await octokit.rest.users.getAuthenticated();

                return login;
              },
              tokens,
              newSessionId,
              oldSessionId,
              provider.Details?.IsPrimary
            );
          },
          base,
          ctx.Runtime.URLMatch.Path
        );
      } else if (isEaCOAuthProviderDetails(provider.Details)) {
        return oAuthRequest(
          req,
          oAuthConfig,
          async (tokens, _newSessionId, _oldSessionId) => {
            const { accessToken } = tokens;

            const [_header, payload, _signature] = await djwt.decode(
              accessToken
            );

            payload?.toString();
          },
          base,
          ctx.Runtime.URLMatch.Path
        );
      } else {
        throw new Error(
          `The provider '${processor.ProviderLookup}' type cannot be handled.`
        );
      }
    };
  },
};
