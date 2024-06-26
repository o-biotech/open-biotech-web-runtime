import { Action, ActionGroup, classSet, FeaturesProps, StepsFeatures } from '@o-biotech/atomic';
import { callToActionStyles } from '../../styles/actions.tsx';
import { SetupPhaseTypes } from '../../../../src/state/SetupPhaseTypes.ts';
import { ChevronRightIcon } from '../../../../build/iconset/icons/ChevronRightIcon.tsx';

export interface BiotechStepsFeaturesProps extends FeaturesProps {
  setupPhase?: SetupPhaseTypes;
}

export function BiotechStepsFeatures(props: BiotechStepsFeaturesProps) {
  return (
    <StepsFeatures {...props} step={props.setupPhase}>
      {[
        {
          title: 'Connect to Cloud',
          description:
            'Bring your own Azure cloud subscription or get started with a Fathym managed Azure subscription.',
          class: 'bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black',
          children: (
            <ActionGroup class='[&>*]:mx-1 my-2 mt-8'>
              <>
                <Action
                  href='./getting-started/cloud'
                  class={classSet(['flex flex-row'], callToActionStyles.props)}
                >
                  Connect Cloud
                  <ChevronRightIcon class='w-[24px] h-[24px]' />
                </Action>
              </>
            </ActionGroup>
          ),
        },
        {
          title: 'Connect Devices',
          description: 'Register your first device and configure default dashboard services.',
          class: 'bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black',
          children: (
            <ActionGroup class='[&>*]:mx-1 my-2 mt-8'>
              <>
                <Action
                  href='./getting-started/devices'
                  class={classSet(['flex flex-row'], callToActionStyles.props)}
                >
                  Connect Devices
                  <ChevronRightIcon class='w-[24px] h-[24px]' />
                </Action>
              </>
            </ActionGroup>
          ),
        },
        {
          title: 'Set Up Data',
          description:
            'Flow real or simulated device data to the cloud and access it through data dashboards and APIs.',
          class: 'bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black',
          children: (
            <ActionGroup class='[&>*]:mx-1 my-2 mt-8'>
              <>
                <Action
                  href='./getting-started/data'
                  class={classSet(['flex flex-row'], callToActionStyles.props)}
                >
                  Set Up Data
                  <ChevronRightIcon class='w-[24px] h-[24px]' />
                </Action>
              </>
            </ActionGroup>
          ),
          // }, {
          //   title: "Create Applications",
          //   description:
          //     "Easily develop and securely share your data for collaboration and consumer products.",
          //   children: (
          //     <ActionGroup class="[&>*]:mx-1 my-2 mt-8">
          //       <>
          //         <Action
          //           href="./applications"
          //           class={classSet(
          //             ["flex flex-row",
          //           ], callToActionStyles.props)}
          //         >
          //           Create Application

          //           <ChevronRightIcon class="w-[24px] h-[24px]" />
          //         </Action>
          //       </>
          //     </ActionGroup>
          //   ),
        },
      ]}
    </StepsFeatures>
  );
}
