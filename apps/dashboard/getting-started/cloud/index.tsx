import { mergeWithArrays, redirectRequest } from '@fathym/common';
import { EaCLicenseAsCode, EaCLicenseStripeDetails, EaCUserLicense } from '@fathym/eac-licensing';
import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { EaCServiceDefinitions } from '@fathym/eac-azure';
import { loadEaCAzureAPISvc } from '@fathym/eac-azure/steward/clients';
import { PageProps } from '@fathym/eac-applications/preact';
import { Location } from 'npm:@azure/arm-subscriptions';
import CloudConnectHero from '../../../components/organisms/heros/CloudConnectHero.tsx';
import CloudStepsFeatures from '../../../components/organisms/features/CloudStepsFeatures.tsx';
import { OpenBiotechEaC } from '@o-biotech/common/utils';
import { CloudPhaseTypes, OpenBiotechWebState } from '@o-biotech/common/state';
import { EaCRuntimeContext } from '@fathym/eac/runtime';

//export const IsIsland = true;

interface CloudPageData {
  billingScopes: Record<string, string>;

  cloudLookup?: string;

  cloudPhase: CloudPhaseTypes;

  hasGitHubAuth: boolean;

  hasStorageCold?: boolean;

  hasStorageHot?: boolean;

  hasStorageWarm?: boolean;

  isAzureConnected: boolean;

  license?: EaCLicenseAsCode;

  licLookup?: string;

  locations: Location[];

  organizations?: string[];

  resGroupLookup?: string;

  stripePublishableKey: string;

  subs: Record<string, string>;

  tenants: Record<string, string>;

  userLicense?: EaCUserLicense;
}

export const handler: EaCRuntimeHandlerSet<OpenBiotechWebState, CloudPageData> = {
  GET: async (
    _req,
    ctx: EaCRuntimeContext<OpenBiotechWebState, CloudPageData, OpenBiotechEaC>,
  ) => {
    if (!ctx.State.EaC) {
      return redirectRequest('/', false, false);
    }

    const licDetails = ctx.Runtime.EaC.Licenses!['o-biotech']
      .Details as EaCLicenseStripeDetails;

    const data: CloudPageData = {
      billingScopes: {},
      cloudLookup: ctx.State.Cloud.CloudLookup,
      cloudPhase: ctx.State.Cloud.Phase,
      hasGitHubAuth: !!ctx.State.GitHub,
      hasStorageCold: !!ctx.State.Cloud.Storage?.Cold,
      hasStorageHot: !!ctx.State.Cloud.Storage?.Hot,
      hasStorageWarm: !!ctx.State.Cloud.Storage?.Warm,
      isAzureConnected: !!ctx.State.Cloud.AzureAccessToken,
      license: ctx.Runtime.EaC.Licenses!['o-biotech'],
      licLookup: 'o-biotech',
      resGroupLookup: ctx.State.Cloud.ResourceGroupLookup,
      stripePublishableKey: licDetails.PublishableKey,
      locations: [],
      subs: {},
      tenants: {},
      userLicense: ctx.State.UserLicenses?.['o-biotech'],
    };

    const svcCalls: (() => Promise<void>)[] = [];

    const eacAzureSvc = await loadEaCAzureAPISvc(ctx.State.EaCJWT!);

    if (data.cloudLookup) {
      const serviceFiles = [
        'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/services.jsonc',
        'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/api/services.jsonc',
        'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/cold/services.jsonc',
        'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/cold-assignments/services.jsonc',
        'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/hot/services.jsonc',
        'https://raw.githubusercontent.com/lowcodeunit/infrastructure/master/templates/o-biotech/iot/ref-arch/warm/services.jsonc',
      ];

      const svcFileCalls: Promise<EaCServiceDefinitions>[] = serviceFiles.map(
        (sf) => {
          return new Promise((resolve) => {
            fetch(sf).then((fileResp) => {
              fileResp.json().then((response) => {
                resolve(response);
              });
            });
          });
        },
      );

      svcCalls.push(async () => {
        const svcDefs = await Promise.all<EaCServiceDefinitions>(
          svcFileCalls,
        );

        const svcDef = mergeWithArrays<EaCServiceDefinitions>(...svcDefs);

        const locationsResp = await eacAzureSvc.Cloud.Locations(
          ctx.State.EaC!.EnterpriseLookup!,
          data.cloudLookup!,
          svcDef,
        );

        await eacAzureSvc.Cloud.EnsureProviders(
          ctx.State.EaC!.EnterpriseLookup!,
          data.cloudLookup!,
          svcDef,
        );

        data.locations = locationsResp.Locations;
      });
    }

    if (ctx.State.Cloud.AzureAccessToken) {
      const _provider = ctx.Runtime.EaC.Providers!['azure']!;

      svcCalls.push(async () => {
        const tenants = await eacAzureSvc.Azure.Tenants(
          ctx.State.EaC!.EnterpriseLookup!,
          ctx.State.Cloud.AzureAccessToken!,
        );

        data.tenants = tenants.reduce((acc, tenant) => {
          acc[tenant.tenantId!] = tenant.displayName!;

          return acc;
        }, {} as Record<string, string>);
      });

      svcCalls.push(async () => {
        const subs = await eacAzureSvc.Azure.Subscriptions(
          ctx.State.EaC!.EnterpriseLookup!,
          ctx.State.Cloud.AzureAccessToken!,
        );

        data.subs = subs.reduce((acc, sub) => {
          acc[sub.subscriptionId!] = sub.displayName!;

          return acc;
        }, {} as Record<string, string>);
      });

      svcCalls.push(async () => {
        const billingAccounts = await eacAzureSvc.Azure.BillingAccounts(
          ctx.State.EaC!.EnterpriseLookup!,
          ctx.State.Cloud.AzureAccessToken!,
        );

        data.billingScopes = billingAccounts.reduce((acc, billingAccount) => {
          const [id, displayName] = [
            billingAccount.id!,
            billingAccount.displayName,
          ];

          switch (billingAccount.agreementType!) {
            case 'MicrosoftOnlineServicesProgram': {
              acc[id] = `MOSP - ${displayName}`;
              break;
            }

            case 'MicrosoftCustomerAgreement': {
              const billingProfiles = billingAccount.billingProfiles?.value || [];

              billingProfiles.forEach((billingProfile) => {
                const invoiceSections = billingProfile.invoiceSections?.value || [];

                invoiceSections.forEach((invoiceSection) => {
                  acc[
                    invoiceSection.id!
                  ] =
                    `MCA - ${displayName} - Profile - ${billingProfile.displayName} - Invoice - ${invoiceSection.displayName}`;
                });
              });
              break;
            }

            case 'MicrosoftPartnerAgreement': {
              // TODO(mcgear): Add support for Partner Agreement Flows
              // https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-microsoft-partner-agreement?tabs=rest#find-customers-that-have-azure-plans
              // acc[id] = displayName;
              break;
            }

            case 'EnterpriseAgreement': {
              const enrollmentAccounts = billingAccount.enrollmentAccounts || [];

              enrollmentAccounts.forEach((account) => {
                acc[
                  account.id!
                ] = `EA - ${displayName} - Enrollment - ${account.accountName}`;
              });
              break;
            }
          }

          return acc;
        }, {} as Record<string, string>);
      });
    }

    if (ctx.State.GitHub && ctx.State.EaC!.SourceConnections) {
      svcCalls.push(async () => {
        const sourceKey = `GITHUB://${ctx.State.GitHub!.Username}`;

        if (ctx.State.EaC!.SourceConnections![sourceKey]) {
          const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT!);

          const eacConnections = await eacSvc.EaC.Connections<OpenBiotechEaC>({
            EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup!,
            SourceConnections: {
              [sourceKey]: {},
            },
          });

          if (eacConnections.SourceConnections) {
            data.organizations = Object.keys(
              eacConnections.SourceConnections[sourceKey].Organizations || {},
            );
          }
        }
      });
    }

    await await Promise.all(
      svcCalls.map(async (sc) => {
        await sc();
      }),
    );

    return ctx.Render(data);
  },
};

export default function Cloud({ Data }: PageProps<CloudPageData>) {
  return (
    <div>
      <CloudConnectHero hideAction />

      <CloudStepsFeatures
        billingScopes={Data.billingScopes}
        cloudLookup={Data.cloudLookup}
        cloudPhase={Data.cloudPhase}
        locations={Data.locations}
        hasGitHubAuth={Data.hasGitHubAuth}
        hasStorageCold={Data.hasStorageCold}
        hasStorageHot={Data.hasStorageHot}
        hasStorageWarm={Data.hasStorageWarm}
        isAzureConnected={Data.isAzureConnected}
        license={Data.license}
        licLookup={Data.licLookup}
        organizations={Data.organizations}
        resGroupLookup={Data.resGroupLookup}
        stripePublishableKey={Data.stripePublishableKey}
        subs={Data.subs}
        tenants={Data.tenants}
        userLicense={Data.userLicense}
      />
    </div>
  );
}
