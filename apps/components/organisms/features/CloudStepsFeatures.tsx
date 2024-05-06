import { ComponentChildren, JSX } from 'preact';
import { Location, Subscription, TenantIdDescription } from 'npm:@azure/arm-subscriptions';
import { BillingAccount } from 'npm:@azure/arm-billing';
import {
  classSet,
  CloudCALZForm,
  ConnectAzure,
  StepsFeatures,
  StepsFeaturesProps,
} from '@o-biotech/atomic';
import { CloudPhaseTypes } from '../../../../src/state/CloudPhaseTypes.ts';
import { CloudIoTForm } from '../data/iot.form.tsx';

export type CloudStepsFeaturesProps = StepsFeaturesProps & {
  billingScopes: Record<string, string>;

  cloudLookup?: string;

  cloudPhase: CloudPhaseTypes;

  hasGitHubAuth: boolean;

  hasStorageCold?: boolean;

  hasStorageHot?: boolean;

  hasStorageWarm?: boolean;

  isAzureConnected: boolean;

  locations: Location[];

  organizations?: string[];

  resGroupLookup?: string;

  subs: Record<string, string>;

  tenants: Record<string, string>;
};

export default function CloudStepsFeatures(props: CloudStepsFeaturesProps) {
  let currentForm: ComponentChildren = undefined;

  switch (props.cloudPhase) {
    case CloudPhaseTypes.Connect:
      currentForm = (
        <ConnectAzure
          cloudAction='/api/o-biotech/eac/clouds'
          oauthAction='/azure/oauth/signin'
          subAction='/api/o-biotech/eac/clouds/subs'
          class='px-4'
          isConnected={props.isAzureConnected}
          billingScopes={props.billingScopes}
          subs={props.subs}
          tenants={props.tenants}
        />
      );
      break;

    case CloudPhaseTypes.CALZ:
      currentForm = (
        <CloudCALZForm
          action='/api/o-biotech/eac/clouds/resource-groups'
          data-eac-bypass-base
          class='px-4'
          cloudLookup={props.cloudLookup!}
          locations={props.locations}
        />
      );
      break;

    case CloudPhaseTypes.Infrastucture:
      currentForm = (
        <CloudIoTForm
          action='/api/o-biotech/eac/clouds/iot-infrastructure'
          data-eac-bypass-base
          class='px-4'
          cloudLookup={props.cloudLookup!}
          hasGitHubAuth={props.hasGitHubAuth}
          hasStorageCold={props.hasStorageCold}
          hasStorageHot={props.hasStorageHot}
          hasStorageWarm={props.hasStorageWarm}
          organizations={props.organizations}
          resGroupLookup={props.resGroupLookup!}
        />
      );
      break;
  }

  const smCurrentForm = <div class='flex md:hidden'>{{ ...currentForm }}</div>;

  const mdCurrentForm = <div class='hidden md:flex md:justify-center'>{{ ...currentForm }}</div>;

  return (
    <StepsFeatures
      {...props}
      callToAction={mdCurrentForm}
      step={props.cloudPhase}
      class={classSet(['text-left'], props)}
    >
      {[
        {
          title: 'Connect to Azure',
          description:
            'Bring your own Azure cloud subscription or get started with a Fathym managed Azure subscription.',
          class: 'bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black',
          children: smCurrentForm,
        },
        {
          title: 'Cloud Landing Zone',
          description:
            'Deploy a Composable Application Landing Zone (CALZ) to prepare your cloud for devices and applications.',
          class: 'bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black',
          children: smCurrentForm,
        },
        {
          title: 'IoT Infrastructure',
          description:
            'Select IoT cloud infrastructure options for processing, storing and accessing device data.',
          class: 'bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black',
          children: smCurrentForm,
        },
      ]}
    </StepsFeatures>
  );
}
