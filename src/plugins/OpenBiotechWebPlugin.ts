import { EaCAtomicIconsProcessor } from '@fathym/atomic-icons';
import { FathymAtomicIconsPlugin } from '@fathym/atomic-icons/plugin';
import {
  EaCRuntimeConfig,
  EaCRuntimePlugin,
  EaCRuntimePluginConfig,
  FathymAzureContainerCheckPlugin,
} from '@fathym/eac/runtime';
import {
  EaCAPIProcessor,
  EaCAzureADB2CProviderDetails,
  EaCAzureADProviderDetails,
  EaCBaseHREFModifierDetails,
  EaCDenoKVCacheModifierDetails,
  EaCDenoKVDatabaseDetails,
  EaCDFSProcessor,
  EaCESMDistributedFileSystem,
  EaCJWTValidationModifierDetails,
  EaCKeepAliveModifierDetails,
  EaCLocalDistributedFileSystem,
  EaCOAuthModifierDetails,
  EaCOAuthProcessor,
  EaCPreactAppProcessor,
  EaCProxyProcessor,
  EaCStripeModifierDetails,
  EaCTailwindProcessor,
  EaCTracingModifierDetails,
} from '@fathym/eac';
import { IoCContainer } from '@fathym/ioc';
import { EaCMSALProcessor } from '@fathym/msal';
import { DefaultOpenBiotechWebProcessorHandlerResolver } from './DefaultOpenBiotechWebProcessorHandlerResolver.ts';
import { GitHubAppSourceConnectionModifierHandlerResolver } from './GitHubAppSourceConnectionModifierHandlerResolver.ts';
import { DefaultOpenBiotechWebModifierResolver } from './DefaultOpenBiotechWebModifierResolver.ts';
import { GitHubAppSourceConnectionModifierDetails } from './GitHubAppSourceConnectionModifierDetails.ts';
import { CurrentEaCModifierHandlerResolver } from './CurrentEaCModifierHandlerResolver.ts';
import { CurrentEaCModifierDetails } from './CurrentEaCModifierDetails.ts';
import OpenBiotechMSALPlugin from './OpenBiotechMSALPlugin.ts';
import OpenBiotechLicensingPlugin from './OpenBiotechLicensingPlugin.ts';

export default class OpenBiotechWebPlugin implements EaCRuntimePlugin {
  constructor() {}

  public Setup(config: EaCRuntimeConfig): Promise<EaCRuntimePluginConfig> {
    const pluginConfig: EaCRuntimePluginConfig = {
      Name: 'OpenBiotechWebPlugin',
      Plugins: [
        new FathymAzureContainerCheckPlugin(),
        new FathymAtomicIconsPlugin(),
        new OpenBiotechMSALPlugin(),
        new OpenBiotechLicensingPlugin(),
      ],
      EaC: {
        Projects: {
          web: {
            Details: {
              Name: 'Everything as Code Web',
              Description: 'The project to use for the EaC website.',
              Priority: 500,
            },
            ResolverConfigs: {
              azure: {
                Hostname: 'open-biotech-web-runtime.azurewebsites.net',
              },
              dev: {
                Hostname: 'localhost',
                Port: config.Server.port || 8000,
              },
              dev2: {
                Hostname: '127.0.0.1',
                Port: config.Server.port || 8000,
              },
              eac: {
                Hostname: 'openbiotech.co',
              },
              runtime: {
                Hostname: 'runtime.openbiotech.co',
              },
            },
            ModifierResolvers: {
              keepAlive: {
                Priority: 5000,
              },
              oauth: {
                Priority: 10000,
              },
              stripe: {
                Priority: 5000,
              },
            },
            ApplicationResolvers: {
              assets: {
                PathPattern: '/assets*',
                Priority: 200,
              },
              apiProxy: {
                PathPattern: '/api/eac*',
                Priority: 200,
              },
              atomicIcons: {
                PathPattern: '/icons*',
                Priority: 200,
              },
              dashboard: {
                PathPattern: '/dashboard*',
                Priority: 200,
                IsPrivate: true,
                IsTriggerSignIn: true,
              },
              home: {
                PathPattern: '*',
                Priority: 100,
              },
              licensingApi: {
                PathPattern: '/api/o-biotech/licensing/*',
                Priority: 200,
                IsPrivate: true,
              },
              msal: {
                PathPattern: '/azure/oauth/*',
                Priority: 500,
                IsPrivate: true,
                IsTriggerSignIn: true,
              },
              oauth: {
                PathPattern: '/oauth/*',
                Priority: 500,
              },
              // oauthAzure: {
              //   PathPattern: '/azure/oauth/*',
              //   Priority: 500,
              //   IsPrivate: true,
              //   IsTriggerSignIn: true,
              // },
              oauthGitHub: {
                PathPattern: '/github/oauth/*',
                Priority: 500,
                IsPrivate: true,
                IsTriggerSignIn: true,
              },
              oBiotechDataApi: {
                PathPattern: '/api/o-biotech/data*',
                Priority: 200,
              },
              oBiotechEaCApi: {
                PathPattern: '/api/o-biotech/eac*',
                Priority: 200,
                IsPrivate: true,
              },
              tailwind: {
                PathPattern: '/tailwind*',
                Priority: 500,
              },
            },
          },
        },
        Applications: {
          assets: {
            Details: {
              Name: 'Open Biotech Assets',
              Description: 'The static assets for use with Open Biotech.',
            },
            ModifierResolvers: {},
            Processor: {
              Type: 'DFS',
              DFSLookup: 'local:apps/assets',
              CacheControl: {
                'text\\/html': `private, max-age=${60 * 5}`,
                'image\\/': `public, max-age=${60 * 60 * 24 * 365}, immutable`,
                'application\\/javascript': `public, max-age=${60 * 60 * 24 * 365}, immutable`,
                'application\\/typescript': `public, max-age=${60 * 60 * 24 * 365}, immutable`,
                'text\\/css': `public, max-age=${60 * 60 * 24 * 365}, immutable`,
              },
            } as EaCDFSProcessor,
          },
          apiProxy: {
            Details: {
              Name: 'EaC API Proxy',
              Description: 'A proxy for the EaC API service.',
            },
            ModifierResolvers: {},
            Processor: {
              Type: 'Proxy',
              ProxyRoot: 'http://localhost:6130/api/eac',
            } as EaCProxyProcessor,
          },
          atomicIcons: {
            Details: {
              Name: 'Atomic Icons',
              Description: 'The atomic icons for the project.',
            },
            ModifierResolvers: {},
            Processor: {
              Type: 'AtomicIcons',
              Config: {
                IconSet: {
                  IconMap: {
                    add: 'https://api.iconify.design/gg:add.svg',
                    begin: 'https://api.iconify.design/fe:beginner.svg',
                    check: 'https://api.iconify.design/lets-icons:check-fill.svg',
                    'chevron-down': 'https://api.iconify.design/mdi:chevron-down.svg',
                    'chevron-right':
                      'https://api.iconify.design/material-symbols:chevron-right-rounded.svg',
                    'connected-devices':
                      'https://api.iconify.design/material-symbols:cast-connected-outline.svg',
                    copy: 'https://api.iconify.design/solar:copy-outline.svg',
                    delete: 'https://api.iconify.design/material-symbols-light:delete.svg',
                    'device-telemetry':
                      'https://api.iconify.design/material-symbols:query-stats.svg',
                    edit: 'https://api.iconify.design/mdi:edit.svg',
                    'emulated-device':
                      'https://api.iconify.design/material-symbols:android-find-my-device-outline.svg',
                    error: 'https://api.iconify.design/material-symbols:error.svg',
                    loading: 'https://api.iconify.design/line-md:loading-alt-loop.svg',
                    'log-out': 'https://api.iconify.design/ic:sharp-logout.svg',
                    menu: 'https://api.iconify.design/ci:hamburger.svg',
                    notification: 'https://api.iconify.design/mdi:notifications.svg',
                    renew: 'https://api.iconify.design/material-symbols:autorenew.svg',
                    settings: 'https://api.iconify.design/material-symbols-light:settings.svg',
                    sync: 'https://api.iconify.design/ic:baseline-sync.svg',
                    user: 'https://api.iconify.design/material-symbols:account-circle-full.svg',
                    Clouds: 'https://api.iconify.design/ic:baseline-cloud.svg',
                    Details: 'https://api.iconify.design/clarity:details-solid.svg',
                    Handlers: 'https://api.iconify.design/fluent:protocol-handler-16-filled.svg',
                    IoT: 'https://api.iconify.design/fluent:iot-20-filled.svg',
                    SourceConnections: 'https://api.iconify.design/mdi:connection.svg',
                    DevOpsActions: 'https://api.iconify.design/fluent-mdl2:set-action.svg',
                    Secrets: 'https://api.iconify.design/la:user-secret.svg',
                    Sources: 'https://api.iconify.design/mdi:source-repository.svg',
                    GettingStarted: 'https://api.iconify.design/mdi:cast-tutorial.svg',
                  },
                },
                Generate: true,
                SpriteSheet: '/iconset',
              },
            } as EaCAtomicIconsProcessor,
          },
          dashboard: {
            Details: {
              Name: 'Dashboard Site',
              Description: 'The dashboard site to be used for the marketing of the project',
            },
            ModifierResolvers: {
              baseHref: {
                Priority: 10000,
              },
              currentEaC: { Priority: 9000 },
            },
            Processor: {
              Type: 'PreactApp',
              AppDFSLookup: 'local:apps/dashboard',
              ComponentDFSLookups: [
                // ['local:apps/components', ['tsx']],
                ['local:apps/islands', ['tsx']],
                ['esm:fathym_open_biotech_atomic', ['tsx']],
              ],
            } as EaCPreactAppProcessor,
          },
          home: {
            Details: {
              Name: 'Home Site',
              Description: 'The home site to be used for the marketing of the project',
            },
            ModifierResolvers: {
              baseHref: {
                Priority: 10000,
              },
            },
            Processor: {
              Type: 'Proxy',
              ProxyRoot: 'https://www.openbiotech.co',
            } as EaCProxyProcessor,
          },
          msal: {
            Details: {
              Name: 'OAuth Site',
              Description: 'The site for use in OAuth workflows for a user',
            },
            Processor: {
              Type: 'MSAL',
              Config: {
                MSALSignInOptions: {
                  Scopes: [
                    'https://management.core.windows.net//user_impersonation',
                  ], // Your desired scopes go here
                  RedirectURI: '/azure/oauth/callback',
                  SuccessRedirect: '/cloud',
                },
                MSALSignOutOptions: {
                  ClearSession: false,
                  PostLogoutRedirectUri: '/',
                },
              },
              ProviderLookup: 'azure',
            } as EaCMSALProcessor,
          },
          oauth: {
            Details: {
              Name: 'OAuth Site',
              Description: 'The site for use in OAuth workflows for a user',
            },
            Processor: {
              Type: 'OAuth',
              ProviderLookup: 'adb2c',
            } as EaCOAuthProcessor,
          },
          oauthAzure: {
            Details: {
              Name: 'OAuth GitHub App',
              Description: 'The site for use in OAuth workflows for a user against GitHub.',
            },
            ModifierResolvers: {
              currentEaC: { Priority: 9000 },
            },
            Processor: {
              Type: 'OAuth',
              ProviderLookup: 'azure',
            } as EaCOAuthProcessor,
          },
          oauthGitHub: {
            Details: {
              Name: 'OAuth GitHub App',
              Description: 'The site for use in OAuth workflows for a user against GitHub.',
            },
            ModifierResolvers: {
              currentEaC: { Priority: 9000 },
              oauthGitHubCallback: { Priority: 5000 },
            },
            Processor: {
              Type: 'OAuth',
              ProviderLookup: 'o-biotech-github-app',
            } as EaCOAuthProcessor,
          },
          oBiotechDataApi: {
            Details: {
              Name: 'Open Biotech Data API',
              Description: 'The local Data API calls for Open Biotech',
            },
            ModifierResolvers: {
              jwtValidate: {
                Priority: 12000,
              },
            },
            Processor: {
              Type: 'API',
              DFSLookup: 'local:apps/api/data',
              DefaultContentType: 'application/json',
            } as EaCAPIProcessor,
          },
          oBiotechEaCApi: {
            Details: {
              Name: 'Open Biotech EaC API',
              Description: 'The local EaC API calls for Open Biotech',
            },
            ModifierResolvers: { currentEaC: { Priority: 9000 } },
            Processor: {
              Type: 'API',
              DFSLookup: 'local:apps/api/eac',
              DefaultContentType: 'application/json',
            } as EaCAPIProcessor,
          },
          tailwind: {
            Details: {
              Name: 'Tailwind for the Site',
              Description: 'A tailwind config for the site',
            },
            ModifierResolvers: {},
            Processor: {
              Type: 'Tailwind',
              DFSLookups: [
                'local:apps/components',
                'local:apps/dashboard',
                'local:apps/islands',
                'esm:fathym_open_biotech_atomic',
              ],
              ConfigPath: './tailwind.config.ts',
              StylesTemplatePath: './apps/tailwind/styles.css',
              CacheControl: {
                'text\\/css': `public, max-age=${60 * 60 * 24 * 365}, immutable`,
              },
            } as EaCTailwindProcessor,
          },
        },
        DFS: {
          'local:apps/assets': {
            Type: 'Local',
            FileRoot: './apps/assets/',
            WorkerPath: import.meta.resolve(
              '@fathym/eac/runtime/src/runtime/dfs/workers/EaCLocalDistributedFileSystemWorker.ts',
            ),
          } as EaCLocalDistributedFileSystem,
          'local:apps/api/data': {
            Type: 'Local',
            FileRoot: './apps/api/data/',
            DefaultFile: 'index.ts',
            Extensions: ['ts'],
            WorkerPath: import.meta.resolve(
              '@fathym/eac/runtime/src/runtime/dfs/workers/EaCLocalDistributedFileSystemWorker.ts',
            ),
          } as EaCLocalDistributedFileSystem,
          'local:apps/api/eac': {
            Type: 'Local',
            FileRoot: './apps/api/eac/',
            DefaultFile: 'index.ts',
            Extensions: ['ts'],
            WorkerPath: import.meta.resolve(
              '@fathym/eac/runtime/src/runtime/dfs/workers/EaCLocalDistributedFileSystemWorker.ts',
            ),
          } as EaCLocalDistributedFileSystem,
          'local:apps/components': {
            Type: 'Local',
            FileRoot: './apps/components/',
            Extensions: ['tsx'],
            WorkerPath: import.meta.resolve(
              '@fathym/eac/runtime/src/runtime/dfs/workers/EaCLocalDistributedFileSystemWorker.ts',
            ),
          } as EaCLocalDistributedFileSystem,
          'local:apps/dashboard': {
            Type: 'Local',
            FileRoot: './apps/dashboard/',
            DefaultFile: 'index.tsx',
            Extensions: ['tsx'],
            WorkerPath: import.meta.resolve(
              '@fathym/eac/runtime/src/runtime/dfs/workers/EaCLocalDistributedFileSystemWorker.ts',
            ),
          } as EaCLocalDistributedFileSystem,
          'local:apps/islands': {
            Type: 'Local',
            FileRoot: './apps/islands/',
            Extensions: ['tsx'],
            WorkerPath: import.meta.resolve(
              '@fathym/eac/runtime/src/runtime/dfs/workers/EaCLocalDistributedFileSystemWorker.ts',
            ),
          } as EaCLocalDistributedFileSystem,
          'esm:fathym_open_biotech_atomic': {
            Type: 'ESM',
            Root: '@o-biotech/atomic/',
            EntryPoints: ['mod.ts'],
            IncludeDependencies: true,
            WorkerPath: import.meta.resolve(
              '@fathym/eac/runtime/src/runtime/dfs/workers/EaCESMDistributedFileSystemWorker.ts',
            ),
          } as EaCESMDistributedFileSystem,
        },
        Modifiers: {
          baseHref: {
            Details: {
              Type: 'BaseHREF',
              Name: 'Base HREF',
              Description: 'Adjusts the base HREF of a response based on configureation.',
            } as EaCBaseHREFModifierDetails,
          },
          currentEaC: {
            Details: {
              Type: 'CurrentEaC',
              Name: 'OAuth',
              Description: 'Used to restrict user access to various applications.',
            } as CurrentEaCModifierDetails,
          },
          jwtValidate: {
            Details: {
              Type: 'JWTValidation',
              Name: 'Validate JWT',
              Description: 'Validate incoming JWTs to restrict access.',
            } as EaCJWTValidationModifierDetails,
          },
          keepAlive: {
            Details: {
              Type: 'KeepAlive',
              Name: 'Deno KV Cache',
              Description: 'Lightweight cache to use that stores data in a DenoKV database.',
              KeepAlivePath: '/_eac/alive',
            } as EaCKeepAliveModifierDetails,
          },
          oauth: {
            Details: {
              Type: 'OAuth',
              Name: 'OAuth',
              Description: 'Used to restrict user access to various applications.',
              ProviderLookup: 'adb2c',
              SignInPath: '/oauth/signin',
            } as EaCOAuthModifierDetails,
          },
          oauthAzure: {
            Details: {
              Type: 'OAuth',
              Name: 'OAuth Azure',
              Description: 'Used to obtain login details for azure.',
              ProviderLookup: 'azure',
              SignInPath: '/azure/oauth/signin',
            } as EaCOAuthModifierDetails,
          },
          oauthGitHub: {
            Details: {
              Type: 'OAuth',
              Name: 'OAuth GitHub',
              Description: 'Used to restrict user access to various applications.',
              ProviderLookup: 'o-biotech-github-app',
              SignInPath: '/github/oauth/signin',
            } as EaCOAuthModifierDetails,
          },
          oauthGitHubCallback: {
            Details: {
              Type: 'GitHubAppSourceConn',
              Name: 'OAuth GitHub Callback',
              Description: 'Used to restrict user access to various applications.',
              ProviderLookup: 'o-biotech-github-app',
              OAuthDatabaseLookup: 'oauth',
            } as GitHubAppSourceConnectionModifierDetails,
          },
          'static-cache': {
            Details: {
              Type: 'DenoKVCache',
              Name: 'Static Cache',
              Description:
                'Lightweight cache to use that stores data in a DenoKV database for static sites.',
              DenoKVDatabaseLookup: 'cache',
              CacheSeconds: 60 * 20,
            } as EaCDenoKVCacheModifierDetails,
          },
          stripe: {
            Details: {
              Type: 'Stripe',
              Name: 'Stripe',
              Description: 'Stripe middleware for including stripe js on every page.',
              IncludeScript: true,
            } as EaCStripeModifierDetails,
          },
          tracing: {
            Details: {
              Type: 'Tracing',
              Name: 'Tracing',
              Description: 'Lightweight cache to use that stores data in a DenoKV database.',
              TraceRequest: true,
              TraceResponse: true,
            } as EaCTracingModifierDetails,
          },
        },
        Providers: {
          adb2c: {
            DatabaseLookup: 'oauth',
            Details: {
              Name: 'Azure ADB2C OAuth Provider',
              Description: 'The provider used to connect with our azure adb2c instance',
              ClientID: Deno.env.get('AZURE_ADB2C_CLIENT_ID')!,
              ClientSecret: Deno.env.get('AZURE_ADB2C_CLIENT_SECRET')!,
              Scopes: ['openid', Deno.env.get('AZURE_ADB2C_CLIENT_ID')!],
              Domain: Deno.env.get('AZURE_ADB2C_DOMAIN')!,
              PolicyName: Deno.env.get('AZURE_ADB2C_POLICY')!,
              TenantID: Deno.env.get('AZURE_ADB2C_TENANT_ID')!,
              IsPrimary: true,
            } as EaCAzureADB2CProviderDetails,
          },
          azure: {
            DatabaseLookup: 'oauth',
            Details: {
              Name: 'Azure OAuth Provider',
              Description: 'The provider used to connect with Azure',
              ClientID: Deno.env.get('AZURE_AD_CLIENT_ID')!,
              ClientSecret: Deno.env.get('AZURE_AD_CLIENT_SECRET')!,
              Scopes: ['openid'],
              TenantID: Deno.env.get('AZURE_AD_TENANT_ID')!, //common
            } as EaCAzureADProviderDetails,
          },
          // 'o-biotech-github-app': {
          //   DatabaseLookup: 'oauth',
          //   Details: {
          //     Name: 'Open Biotech GitHub App OAuth Provider',
          //     Description:
          //       'The provider used to connect with our Open Biotech GitHub App instance',
          //     AppID: Deno.env.get('GITHUB_APP_ID'),
          //     ClientID: Deno.env.get('GITHUB_CLIENT_ID')!,
          //     ClientSecret: Deno.env.get('GITHUB_CLIENT_SECRET')!,
          //     PrivateKey: Deno.env.get('GITHUB_PRIVATE_KEY')!,
          //     Scopes: ['openid'],
          //     WebhooksSecret: Deno.env.get('GITHUB_WEBHOOKS_SECRET')!,
          //   } as EaCGitHubAppProviderDetails,
          // },
        },
        Databases: {
          cache: {
            Details: {
              Type: 'DenoKV',
              Name: 'Local Cache',
              Description: 'The Deno KV database to use for local caching',
              DenoKVPath: Deno.env.get('LOCAL_CACHE_DENO_KV_PATH') || undefined,
            } as EaCDenoKVDatabaseDetails,
          },
          'o-biotech': {
            Details: {
              Type: 'DenoKV',
              Name: 'Local Cache',
              Description: 'The Deno KV database to use for local caching',
              DenoKVPath: Deno.env.get('O_BIOTECH_DENO_KV_PATH') || undefined,
            } as EaCDenoKVDatabaseDetails,
          },
          oauth: {
            Details: {
              Type: 'DenoKV',
              Name: 'Local Cache',
              Description: 'The Deno KV database to use for local caching',
              DenoKVPath: Deno.env.get('OAUTH_DENO_KV_PATH') || undefined,
            } as EaCDenoKVDatabaseDetails,
          },
        },
      },
      IoC: new IoCContainer(),
    };

    pluginConfig.IoC!.Register(DefaultOpenBiotechWebModifierResolver, {
      Type: pluginConfig.IoC!.Symbol('ModifierHandlerResolver'),
    });

    pluginConfig.IoC!.Register(() => CurrentEaCModifierHandlerResolver, {
      Name: 'CurrentEaCModifierDetails',
      Type: pluginConfig.IoC!.Symbol('ModifierHandlerResolver'),
    });

    pluginConfig.IoC!.Register(
      () => GitHubAppSourceConnectionModifierHandlerResolver,
      {
        Name: 'GitHubAppSourceConnectionModifierDetails',
        Type: pluginConfig.IoC!.Symbol('ModifierHandlerResolver'),
      },
    );

    pluginConfig.IoC!.Register(DefaultOpenBiotechWebProcessorHandlerResolver, {
      Type: pluginConfig.IoC!.Symbol('ProcessorHandlerResolver'),
    });

    return Promise.resolve(pluginConfig);
  }
}
