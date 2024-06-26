import { Action, ActionGroup, classSet } from '@o-biotech/atomic';
import DeviceDataFlowing from './device-data-flowing.tsx';
import { callToActionStyles } from '../../../components/styles/actions.tsx';
import { IconProps } from '@fathym/atomic-icons/browser';

export const IsIsland = true;

export type DeviceDataFlowingContinueProps = {
  jwt: string;
} & IconProps;

export default function DeviceDataFlowingContinue(
  props: DeviceDataFlowingContinueProps,
) {
  return (
    <DeviceDataFlowing
      jwt={props.jwt}
      waitingText='Waiting for device data (this can take several minutes after posting your data)...'
      class='w-20 h-20'
    >
      <ActionGroup class='mt-8 flex-col'>
        <>
          <Action
            type='submit'
            class={classSet(
              [
                'w-full md:w-auto text-white font-bold m-1 py-2 px-4 rounded focus:outline-none shadow-lg',
              ],
              callToActionStyles.props,
            )}
          >
            Move to Explore Data
          </Action>
        </>
      </ActionGroup>
    </DeviceDataFlowing>
  );
}
