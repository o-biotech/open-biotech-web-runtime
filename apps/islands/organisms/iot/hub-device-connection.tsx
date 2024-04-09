import { JSX } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { CopyInput, Select } from '@o-biotech/atomic';

export const IsIsland = true;

export type IoTHubDeviceConnectionDisplayProps = {
  deviceKeys: Record<string, string>;

  deviceChanged?: (devices: string[]) => void;

  resGroupLookup: string;
} & JSX.HTMLAttributes<HTMLSelectElement>;

export default function IoTHubDeviceConnectionDisplay(
  props: IoTHubDeviceConnectionDisplayProps,
) {
  const selectRef = useRef<HTMLSelectElement>(null);

  const deviceLookups = Object.keys(props.deviceKeys || {});

  const [selectedDevices, setSelectedDevices] = useState(
    [deviceLookups[0]].filter((dl) => dl),
  );

  const onDeviceChange = (e: JSX.TargetedEvent<HTMLSelectElement, Event>) => {
    const target = e.target! as HTMLSelectElement;

    const devices: string[] = Array.from(target.options)
      .filter((opt) => opt.selected)
      .map((opt) => opt.value);

    setSelectedDevices(devices);

    if (props.deviceChanged) {
      props.deviceChanged(devices);
    }
  };

  if (props.deviceChanged) {
    props.deviceChanged(selectedDevices);
  }

  const shortName = props.resGroupLookup
    .split('-')
    .map((p) => p.charAt(0))
    .join('');

  return (
    <>
      <div class='w-full'>
        <label
          for='deviceLookup'
          class='block uppercase tracking-wide font-bold mb-0 text-xl'
        >
          Select IoT Hub Device
        </label>

        <p class='block text-md mb-4'>
          Select the IoT Hub device you'd like to use.
        </p>

        <Select
          id='deviceLookup'
          name='deviceLookup'
          required
          multiple
          {...props}
          ref={selectRef}
          onChange={onDeviceChange}
        >
          {deviceLookups?.map((deviceLookup) => {
            return (
              <option
                value={deviceLookup}
                selected={selectedDevices.some((dl) => dl === deviceLookup)}
              >
                {deviceLookup}
              </option>
            );
          })}
        </Select>

        <label
          for='device'
          class='block uppercase tracking-wide font-bold mt-4 mb-2 text-xl'
        >
          Device Connection Strings
        </label>

        <p class='block text-md mb-2'>
          Copy the device connection string to send a message from your device to IoT Hub and
          establish connection.
        </p>

        {selectedDevices.map((selectedDevice) => {
          const deviceConnStr =
            `HostName=${shortName}-iot-hub.azure-devices.net;DeviceId=${selectedDevice};SharedAccessKey=${
              props.deviceKeys[selectedDevice]
            }`;

          return (
            <>
              <label
                for='device'
                class='block uppercase tracking-wide font-bold mb-0 text-md'
              >
                {selectedDevice} - Connection String
              </label>

              <CopyInput
                id='deviceConnStr'
                name='deviceConnStr'
                type='text'
                class='mb-2'
                value={deviceConnStr}
              />
            </>
          );
        })}
      </div>
    </>
  );
}
