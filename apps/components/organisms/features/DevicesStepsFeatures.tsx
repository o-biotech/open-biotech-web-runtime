import { ComponentChildren } from 'preact';
import { StepsFeatures, StepsFeaturesProps } from '@o-biotech/atomic';
import { DeviceForm } from '../devices/device.form.tsx';
import DevicesDashboardForm from '../devices/dashboards.form.tsx';
import { DevicesPhaseTypes } from '../../../../src/state/DevicesPhaseTypes.ts';

export interface DevicesStepsFeaturesProps extends StepsFeaturesProps {
  cloudLookup: string;

  deviceLookup?: string;

  devicesPhase?: DevicesPhaseTypes;

  iotLookup: string;

  jwt: string;

  resGroupLookup: string;
}

export function DevicesStepsFeatures(props: DevicesStepsFeaturesProps) {
  let currentForm: ComponentChildren = undefined;

  switch (props.devicesPhase) {
    case DevicesPhaseTypes.Connect:
      currentForm = (
        <DeviceForm
          cloudLookup={props.cloudLookup}
          deviceLookup={props.deviceLookup}
          iotLookup={props.iotLookup}
          resGroupLookup={props.resGroupLookup}
          class='px-4'
        />
      );
      break;

    // case DevicesPhaseTypes.APIs:
    //   currentForm = <APIJWTForm class="px-4" jwt={props.jwt} />;
    //   break;

    case DevicesPhaseTypes.Dashboards:
      currentForm = <DevicesDashboardForm class='px-4' iotLookup={props.iotLookup} />;
      break;
  }

  const smCurrentForm = <div class='flex md:hidden'>{{ ...currentForm }}</div>;

  const mdCurrentForm = <div class='hidden md:flex md:justify-center'>{{ ...currentForm }}</div>;

  return (
    <StepsFeatures
      {...props}
      callToAction={mdCurrentForm}
      step={props.devicesPhase}
    >
      {[
        {
          title: 'Connect a Device',
          description: 'Register a device name to Azure IoT Hub.',
          class: 'bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black',
          children: smCurrentForm,
        },
        // {
        //   title: "Configure Data APIs",
        //   description:
        //     "Get familiar with and control access to your data APIs.",
        //   children: smCurrentForm,
        // },
        {
          title: 'Set Up Data Dashboards',
          description: 'Select default dashboard services to explore device data.',
          class: 'bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black',
          children: smCurrentForm,
        },
      ]}
    </StepsFeatures>
  );
}
