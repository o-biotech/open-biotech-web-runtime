import { EaCRuntimeConfig, EaCRuntimePluginConfig } from '@fathym/eac/runtime/config';
import { EaCRuntimePlugin } from '@fathym/eac/runtime/plugins';
import { MSALPlugin } from '@fathym/msal';
import { createOAuthHelpers } from '@fathym/common/oauth';
import { loadOAuth2ClientConfig } from '@fathym/eac-applications/runtime/modules';
import { EverythingAsCode } from '@fathym/eac';
import { EverythingAsCodeIdentity } from '@fathym/eac-identity';

export default class OpenBiotechMSALPlugin implements EaCRuntimePlugin {
  constructor() {}

  public Setup(_config: EaCRuntimeConfig): Promise<EaCRuntimePluginConfig> {
    const pluginConfig: EaCRuntimePluginConfig = {
      Name: 'OpenBiotechMSALPlugin',
      Plugins: [
        new MSALPlugin({
          async Resolve(
            ioc,
            _processor,
            eac: EverythingAsCode & EverythingAsCodeIdentity,
          ) {
            const primaryProviderLookup = Object.keys(eac.Providers || {}).find(
              (pl) => eac.Providers![pl].Details!.IsPrimary,
            );

            const provider = eac.Providers![primaryProviderLookup!]!;

            const oAuthConfig = loadOAuth2ClientConfig(provider)!;

            const helpers = createOAuthHelpers(oAuthConfig);

            const kv = await ioc.Resolve<Deno.Kv>(
              Deno.Kv,
              provider.DatabaseLookup,
            );

            const keyRoot = ['MSAL', 'Session'];

            return {
              async Clear(req) {
                const sessionId = await helpers.getSessionId(req);

                const kvKey = [...keyRoot, sessionId!];

                const results = await kv.list({ prefix: kvKey });

                for await (const result of results) {
                  await kv.delete(result.key);
                }
              },
              async Load(req, key) {
                const sessionId = await helpers.getSessionId(req);

                const kvKey = [...keyRoot, sessionId!, key];

                const res = await kv.get(kvKey);

                return res.value;
              },
              async Set(req, key, value) {
                const sessionId = await helpers.getSessionId(req);

                const kvKey = [...keyRoot, sessionId!, key];

                await kv.set(kvKey, value, {
                  expireIn: 1000 * 60 * 30,
                });
              },
            };
          },
        }),
      ],
    };

    return Promise.resolve(pluginConfig);
  }
}
