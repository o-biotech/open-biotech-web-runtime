import {
  Action,
  ActionGroup,
  ActionStyleTypes,
  classSet,
  StepsFeatures,
  StepsFeaturesProps,
} from '@o-biotech/atomic';
import { ApplicationsPhaseTypes } from '../../../../src/state/ApplicationsPhaseTypes.ts';
import { callToActionStyles } from '../../styles/actions.tsx';

export interface ApplicationsStepsFeaturesProps extends StepsFeaturesProps {
  appsPhase?: ApplicationsPhaseTypes;
}

export function ApplicationsStepsFeatures(
  props: ApplicationsStepsFeaturesProps,
) {
  return (
    <StepsFeatures {...props} step={props.appsPhase}>
      {[
        {
          title: 'Connect to GitHub',
          description: 'Connect with GitHub to build your own applications.',
          children: (
            <ActionGroup class='[&>*]:mx-1 my-2 mt-8'>
              <>
                <Action
                  href='./getting-started/devices/connect/now'
                  class={classSet(['m-2'], callToActionStyles.props)}
                >
                  Connect Device
                </Action>

                <Action
                  href='./cloud/connect/acquire'
                  class='m-2'
                  actionStyle={ActionStyleTypes.Link |
                    ActionStyleTypes.Outline |
                    ActionStyleTypes.Rounded}
                >
                  Acquire Device
                </Action>
              </>
            </ActionGroup>
          ),
        },
        {
          title: 'Deploy Applications',
          description: 'Securely deploy your developed applications into the cloud.',
          children: (
            <ActionGroup class='[&>*]:mx-1 my-2 mt-8'>
              <>
                <Action
                  href='./cloud/calz'
                  class={classSet(['m-2'], callToActionStyles.props)}
                >
                  Configure Flows
                </Action>
              </>
            </ActionGroup>
          ),
        },
        {
          title: 'Share Progress',
          description:
            'Share ideas to colleagues, partners and/or customers with built in security and scalability.',
          children: (
            <ActionGroup class='[&>*]:mx-1 my-2 mt-8'>
              <>
                <Action
                  href='./cloud/calz'
                  class={classSet(['m-2'], callToActionStyles.props)}
                >
                  Configure Flows
                </Action>
              </>
            </ActionGroup>
          ),
        },
      ]}
    </StepsFeatures>
  );
}
