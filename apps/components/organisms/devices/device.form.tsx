import { JSX } from 'preact';
import { Action, ActionGroup, ActionStyleTypes, classSet, Input } from '@o-biotech/atomic';
import { Location } from 'npm:@azure/arm-subscriptions';
import { callToActionStyles } from '../../styles/actions.tsx';
import { useState } from 'preact/hooks';
import { FaQuestionCircle } from 'react-icons/fa';

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
      className={classSet(
        ['-:w-full -:max-w-sm -:md:max-w-md -:mx-auto -:p-3 -:mt-8'],
        props,
      )}
    >
      <div className='flex flex-wrap -mx-3 mb-4 text-left'>
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

        <div className='w-full px-3'>
          <label
            htmlFor='device'
            className='block uppercase tracking-wide font-bold mb-0 text-xl'
          >
            Device Name
          </label>

          <div className='block uppercase tracking-wide font-bold mb-2 text-sm'>
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

        <div className='w-full p-3'>
          <div className='flex items-center mb-2'>
            <Input
              id='isIoTEdge'
              name='isIoTEdge'
              type='checkbox'
              value='isIoTEdge'
              className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
            />
            <label htmlFor='isIoTEdge' className='ms-2 text-sm font-medium pl-3'>
              Is IoT Edge Device?
            </label>
          </div>

          <div className='flex items-center mb-2'>
            <Input
              id='isSimulated'
              name='isSimulated'
              type='checkbox'
              value='isSimulated'
              className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
              onChange={() => setIsSimulated(!isSimulated)}
            />
            <label htmlFor='isSimulated' className='ms-2 text-sm font-medium pl-3'>
              Create a simulated device?
            </label>
            <div className="relative group">
              <FaQuestionCircle className='ml-2 text-gray-500 cursor-pointer' />
              <div className="absolute left-0 w-64 p-2 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                This option creates a simulated device for testing purposes. The simulated device name defaults to "simulated-device".
              </div>
            </div>
          </div>

          {isSimulated && (
            <div className='w-full px-3'>
              <label
                htmlFor='simulatedDeviceName'
                className='block uppercase tracking-wide font-bold mb-0 text-xl'
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
                className='w-full px-3 py-2 border border-gray-300 rounded mt-1'
              />
            </div>
          )}
        </div>
      </div>

      <ActionGroup className='mt-8 flex-col'>
        <>
          <Action
            type='submit'
            className={classSet(
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
