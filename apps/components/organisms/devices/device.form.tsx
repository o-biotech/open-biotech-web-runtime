import { JSX } from 'preact';
import { Action, ActionGroup, ActionStyleTypes, classSet, Input } from '@o-biotech/atomic';
import { Location } from 'npm:@azure/arm-subscriptions';
import { callToActionStyles } from '../../styles/actions.tsx';
import { useState } from 'preact/hooks';

export type DeviceFormProps = JSX.HTMLAttributes<HTMLFormElement> & {
  cloudLookup: string;

  deviceLookup?: string;

  simulatedDeviceLookup?: string;

  iotLookup: string;

  resGroupLookup: string;
};

export function DeviceForm(props: DeviceFormProps) {
  // State to manage the visibility of the simulated device input
  const [isSimulated, setIsSimulated] = useState(false);

  return (
    <form
      method='post'
      action='/api/o-biotech/eac/iot/devices/ensure'
      data-eac-bypass-base
      {...props}
      class={classSet(
        ['-:w-full -:max-w-sm -:md:max-w-md -:mx-auto -:p-3 -:mt-8'],
        props,
      )}
    >
      <div class='flex flex-wrap -mx-3 mb-4 text-left'>
        <Input
          id='cloudLookup'
          name='cloudLookup'
          type='hidden'
          value={props.cloudLookup}
        />

        <Input
          id='resGroupLookup'
          name='resGroupLookup'
          type='hidden'
          value={props.resGroupLookup}
        />

        <Input
          id='iotLookup'
          name='iotLookup'
          type='hidden'
          value={props.iotLookup}
        />

        <div class='w-full px-3'>
          <label
            for='device'
            class='block uppercase tracking-wide font-bold mb-0 text-xl'
          >
            Device Name
          </label>

          <div class='block uppercase tracking-wide font-bold mb-2 text-sm'>
            (alphanumeric with - and _)
          </div>

          <Input
            id='deviceLookup'
            name='deviceLookup'
            type='text'
            required
            disabled={!!props.deviceLookup}
            placeholder='Enter new device name'
          />
        </div>

        <div class='w-full p-3'>
          <div class='flex items-center mb-2'>
            <Input
              id='isIoTEdge'
              name='isIoTEdge'
              type='checkbox'
              value='isIoTEdge'
              class='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
            />
            <label htmlFor='isIoTEdge' class='ms-2 text-sm font-medium pl-3'>
              Is IoT Edge Device?
            </label>
          </div>

          <div class='flex items-center mb-2'>
            <Input
              id='isSimulated'
              name='isSimulated'
              type='checkbox'
              value='isSimulated'
              class='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
              onChange={() => setIsSimulated(!isSimulated)}
            />
            <label htmlFor='isSimulated' class='ms-2 text-sm font-medium pl-3'>
              Create a simulated device?
            </label>
            <div class="relative group">
              <HelpIcon class="w-4 h-4" />
              <div class="absolute left-0 w-64 p-2 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                This option creates a simulated device for testing purposes. The simulated device name defaults to "simulated-device".
              </div>
            </div>
          </div>

          {isSimulated && (
            <div class='w-full px-3'>
              <label
                htmlFor='simulatedDeviceName'
                class='block uppercase tracking-wide font-bold mb-0 text-xl'
              >
                Simulated Device Name
              </label>
              <Input
                id='simulatedDeviceName'
                name='simulatedDeviceName'
                type='text'
                readOnly
                value='simulated-device'
                placeholder='simulated-device'
                class='w-full px-3 py-2 border border-gray-300 rounded mt-1'
              />
            </div>
          )}
        </div>
      </div>

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
            {isSimulated ? 'Save Device(s)' : 'Save Device'}
          </Action>
        </>
      </ActionGroup>
    </form>
  );
}
