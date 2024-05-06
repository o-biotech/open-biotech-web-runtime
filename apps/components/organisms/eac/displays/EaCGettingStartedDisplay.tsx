import { OpenBiotechEaC } from '../../../../../src/eac/OpenBiotechEaC.ts';
import { Checklist, ChecklistItem } from '../../../molecules/Checklist.tsx';
import { SetupPhaseTypes } from '../../../../../src/state/SetupPhaseTypes.ts';
import { CloudPhaseTypes } from '../../../../../src/state/CloudPhaseTypes.ts';
import { DataPhaseTypes } from '../../../../../src/state/DataPhaseTypes.ts';
import { DevicesPhaseTypes } from '../../../../../src/state/DevicesPhaseTypes.ts';

export function EaCGettingStartedDisplay(props: {
  eac?: OpenBiotechEaC;

  cloudPhase?: CloudPhaseTypes;

  dataPhase?: DataPhaseTypes;

  devicesPhase?: DevicesPhaseTypes;

  phase: SetupPhaseTypes;
}) {
  const checklist: ChecklistItem[] = [];

  checklist.push({
    Title: 'Create Enterprise',
    Complete: !!props.eac,
    ActionPath: './',
  });

  checklist.push({
    Title: 'Connect to Cloud',
    Complete: props.phase > 0,
    ActionPath: './',
    SubList: props.cloudPhase
      ? [
        {
          Title: 'Connect to Azure',
          Complete: props.cloudPhase > 0,
          ActionPath: './getting-started/cloud',
        },
        {
          Title: 'Cloud Landing Zone',
          Complete: props.cloudPhase > 1,
          ActionPath: './getting-started/cloud',
        },
        {
          Title: 'IoT Infrastructure',
          Complete: props.cloudPhase > 2,
          ActionPath: './getting-started/cloud',
        },
      ]
      : [],
  });

  checklist.push({
    Title: 'Connect Devices',
    Complete: props.phase > 1,
    ActionPath: './',
    SubList: props.devicesPhase
      ? [
        {
          Title: 'Connect a Device',
          Complete: props.devicesPhase > 0,
          ActionPath: './getting-started/devices',
        },
        // {
        //   Title: "Configure Data APIs",
        //   Complete: state.Devices.Phase > 1,
        //   ActionPath: './getting-started/devices',
        // },
        {
          Title: 'Set Up Data Dashboards',
          Complete: props.devicesPhase > 1,
          ActionPath: './getting-started/devices',
        },
      ]
      : [],
  });

  checklist.push({
    Title: 'Set Up Data',
    Complete: props.phase > 2,
    ActionPath: './',
    SubList: props.dataPhase
      ? [
        {
          Title: 'Confirm Data Flowing',
          Complete: props.dataPhase > 0,
          ActionPath: './getting-started/data',
        },
        {
          Title: 'Explore Data',
          Complete: props.dataPhase > 1,
          ActionPath: './getting-started/data',
        },
        {
          Title: 'Develop Solutions',
          Complete: props.dataPhase > 2,
          ActionPath: './getting-started/data',
        },
      ]
      : [],
  });

  return <Checklist items={checklist} />;
}
