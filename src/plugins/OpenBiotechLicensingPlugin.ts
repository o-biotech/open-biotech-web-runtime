import { EaCStripeProcessor, EverythingAsCode } from '@fathym/eac';
import { EaCRuntimeConfig, EaCRuntimePlugin, EaCRuntimePluginConfig } from '@fathym/eac/runtime';
import * as djwt from 'https://deno.land/x/djwt@v3.0.0/mod.ts';
import { loadEaCSvc } from '@fathym/eac/api';
import { IoCContainer } from 'https://deno.land/x/fathym_ioc@v0.0.10/src/ioc/ioc.ts';

export default class OpenBiotechLicensingPlugin implements EaCRuntimePlugin {
  constructor() {}

  public Setup(_config: EaCRuntimeConfig): Promise<EaCRuntimePluginConfig> {
    const pluginConfig: EaCRuntimePluginConfig = {
      Name: 'OpenBiotechLicensingPlugin',
      EaC: {
        Applications: {
          licensingApi: {
            Details: {
              Name: 'Open Biotech Licensing API',
              Description: 'The licensing API for Open Biotech.',
            },
            ModifierResolvers: {},
            Processor: {
              Type: 'Stripe',
              DatabaseLookup: 'o-biotech',
              LicenseLookup: 'o-biotech',
            } as EaCStripeProcessor,
          },
        },
        Licenses: {
          'o-biotech': {
            DatabaseLookup: 'o-biotech',
            Details: {
              Name: 'OpenBiotech',
              Description: 'The main access license for OpenBiotech',
              Enabled: true,
              PublishableKey: Deno.env.get('STRIPE_PUBLISHABLE_KEY')!,
              SecretKey: Deno.env.get('STRIPE_SECRET_KEY')!,
              WebhookSecret: Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
            },
            Plans: {
              standard: {
                Details: {
                  Name: 'Standard',
                  Description: 'A standard license',
                  Featured: 'Popular',
                  Features: [
                    '1 Enterprise',
                    'Cloud Provisioning',
                    'Other Stuff',
                  ],
                  Priority: 200,
                },
                Prices: {
                  monthly: {
                    Details: {
                      Name: 'Monthly',
                      Currency: 'USD',
                      Discount: 0,
                      Interval: 'month',
                      Value: 99.99,
                    },
                  },
                  yearly: {
                    Details: {
                      Name: 'Yearly',
                      Currency: 'USD',
                      Discount: 0,
                      Interval: 'year',
                      Value: 999.99,
                    },
                  },
                },
              },
              pro: {
                Details: {
                  Name: 'Pro',
                  Description: 'A professional license',
                  Featured: '',
                  Features: [
                    'Unlimited Enterprise',
                    'Cloud Provisioning',
                    'Even Cooler Stuff',
                  ],
                  Popular: '',
                  Priority: 100,
                },
                Prices: {
                  monthly: {
                    Details: {
                      Name: 'Monthly',
                      Currency: 'USD',
                      Discount: 0,
                      Interval: 'month',
                      Value: 249.99,
                    },
                  },
                  yearly: {
                    Details: {
                      Name: 'Yearly',
                      Currency: 'USD',
                      Discount: 0,
                      Interval: 'year',
                      Value: 2499.99,
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    return Promise.resolve(pluginConfig);
  }

  public async Build(
    _eac: EverythingAsCode,
    _ioc: IoCContainer,
    pluginCfg?: EaCRuntimePluginConfig,
  ): Promise<void> {
    const eacApiKey = Deno.env.get('EAC_API_KEY');

    if (eacApiKey && pluginCfg) {
      try {
        const [_header, payload] = await djwt.decode(eacApiKey);

        const { EnterpriseLookup } = payload as Record<string, string>;

        const eacSvc = await loadEaCSvc(eacApiKey);

        await eacSvc.Commit(
          {
            EnterpriseLookup,
            ...pluginCfg.EaC!,
          },
          600,
        );
      } catch (_err) {
        console.error(
          'Unable to update EaC Licensing, falling back to local config.',
        );
      }
    }
  }
}
