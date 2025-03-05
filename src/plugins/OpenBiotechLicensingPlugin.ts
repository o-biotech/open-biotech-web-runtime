import { EverythingAsCode } from '@fathym/eac';
import { EaCRuntimeConfig, EaCRuntimePluginConfig } from '@fathym/eac/runtime/config';
import { EaCRuntimePlugin } from '@fathym/eac/runtime/plugins';

import * as djwt from 'jsr:@zaubrik/djwt@3.0.2';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { IoCContainer } from '@fathym/ioc';
import { EaCStripeProcessor } from '@fathym/eac-applications/processors';

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
                  Description: 'Get Started with 1 enterprise workspace',
                  Featured: 'Popular',
                  Features: [
                    'Fully Provisioned Azure Cloud',
                    '1 Enterprise Workspace',
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
                  Description: 'Scale with unlimited workspaces',
                  Featured: '',
                  Features: [
                    'Fully Provisioned Azure Cloud',
                    'Unlimited Enterprise Workspaces',
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

        const eacSvc = await loadEaCStewardSvc(eacApiKey);

        await eacSvc.EaC.Commit(
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
