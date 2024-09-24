import { ComponentChildren } from 'preact';
import { StepsFeatures, StepsFeaturesProps } from '@o-biotech/atomic';
import { DataFlowForm } from '../data/flow.form.tsx';
import DataExploreForm from '../../../islands/organisms/data/explore-form.tsx';
import { DataPhaseTypes } from '../../../../src/state/DataPhaseTypes.ts';
import { StorageAPIsDisplay } from '../../molecules/StorageAPIsDisplay.tsx';
import { DataDevelopForm } from '../data/develop.form.tsx';

export const IsIsland = true;

export interface DataStepsFeaturesProps extends StepsFeaturesProps {
  dashboardTypes: string[];

  dataPhase?: DataPhaseTypes;

  deviceKeys: Record<string, string>;

  iotHubKeys: Record<string, string>;

  hasStorageCold: boolean;

  hasStorageHot: boolean;

  hasStorageWarm: boolean;

  jwt: string;

  kustoCluster: string;

  kustoLocation: string;

  resGroupLookup: string;
}

export function DataStepsFeatures(props: DataStepsFeaturesProps) {
  let currentForm: ComponentChildren = undefined;

  switch (props.dataPhase) {
    case DataPhaseTypes.Flow:
      currentForm = (
        <DataFlowForm
          class='px-4'
          deviceKeys={props.deviceKeys}
          iotHubKeys={props.iotHubKeys}
          jwt={props.jwt}
          resGroupLookup={props.resGroupLookup}
        />
      );
      break;

    case DataPhaseTypes.Explore:
      currentForm = (
        <DataExploreForm
          dashboardTypes={props.dashboardTypes}
          jwt={props.jwt}
          kustoCluster={props.kustoCluster}
          kustoLocation={props.kustoLocation}
          class='px-4'
        />
      );
      break;

    case DataPhaseTypes.Develop:
      currentForm = (
        <div>
          <StorageAPIsDisplay
            hasStorageCold={props.hasStorageCold}
            hasStorageHot={props.hasStorageHot}
            hasStorageWarm={props.hasStorageWarm}
            class='m-8 md:m-16'
            jwt={props.jwt}
          />

          <DataDevelopForm />
        </div>
      );
      break;
  }

  const smCurrentForm = <div class='flex md:hidden'>{{ ...currentForm }}</div>;

  const mdCurrentForm = <div class='hidden md:flex md:justify-center'>{{ ...currentForm }}</div>;

  return (
    <StepsFeatures
      {...props}
      callToAction={mdCurrentForm}
      step={props.dataPhase}
    >
      {[
        {
          title: 'Confirm Data Flowing',
          description:
            'Simulate device data or connect a physical device to the device previously registered on Azure IoT Hub.',
          class: 'bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black',
          children: smCurrentForm,
        },
        {
          title: 'Explore Data',
          description: 'Explore flowing device data through default dashboard services.',
          class: 'bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black',
          children: smCurrentForm,
        },
        {
          title: 'Develop Solutions',
          description:
            'Use APIs to call device data, combine with third-party services or assemble custom apps.',
          class: 'bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black',
          children: smCurrentForm,
        },
      ]}
    </StepsFeatures>
  );
}
