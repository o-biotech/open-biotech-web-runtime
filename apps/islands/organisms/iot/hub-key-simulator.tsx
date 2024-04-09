import { JSX } from 'preact';
import { useState } from 'preact/hooks';
import { CopyInput } from '@o-biotech/atomic';
import IoTHubKeyConnectionDisplay from './hub-key-connection.tsx';
import IoTHubDeviceConnectionDisplay from './hub-device-connection.tsx';

export const IsIsland = true;

export type IoTHubKeySimulatorDisplayProps = JSX.HTMLAttributes<HTMLSelectElement> & {
  deviceKeys: Record<string, string>;

  iotHubKeys: Record<string, string>;

  resGroupLookup: string;
};

export default function IoTHubKeySimulatorDisplay(
  props: IoTHubKeySimulatorDisplayProps,
) {
  const [selectedKey, setSelectedKey] = useState('');

  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  const onKeyChange = (key: string) => {
    setSelectedKey(key);
  };

  const onDeviceChange = (devices: string[]) => {
    setSelectedDevices(devices);
  };

  const shortName = props.resGroupLookup
    .split('-')
    .map((p) => p.charAt(0))
    .join('');

  const connStr = selectedKey
    ? `HostName=${shortName}-iot-hub.azure-devices.net;SharedAccessKeyName=${selectedKey};SharedAccessKey=${
      props.iotHubKeys[selectedKey]
    }`
    : '';

  const devices = selectedDevices;

  const simCmd = selectedKey
    // ? `docker run -it -e "IotHubConnectionString=${connStr}" -e Template="{ \\\"deviceId\\\": \\\"$.DeviceId\\\", \\\"rand_int\\\": $.Temp, \\\"rand_double\\\": 10, \\\"Ticks\\\": $.Ticks, \\\"Counter\\\": $.Counter, \\\"time\\\": \\\"$.Time\\\" }" -e Variables="[{name: \\\"Temp\\\", \\\"random\\\": true, \\\"max\\\": 25, \\\"min\\\": 23}, {\\\"name\\\":\\\"Counter\\\", \\\"min\\\":100, \\\"max\\\":102} ]" -e DeviceList="${
    //   devices.join(
    //     ",",
    //   )
    ? `docker run -it -e "IotHubConnectionString=${connStr}" -e DeviceList="${
      devices.join(
        ',',
      )
    }" mcr.microsoft.com/oss/azure-samples/azureiot-telemetrysimulator`
    : '';

  return (
    <>
      <IoTHubKeyConnectionDisplay
        class='px-3'
        iotHubKeys={props.iotHubKeys}
        keyChanged={onKeyChange}
      />

      <div class='w-full mb-8'>
        <label
          for='connStr'
          class='block uppercase tracking-wide font-bold mb-0 text-xl'
        >
          Connection String
        </label>

        <CopyInput id='connStr' name='connStr' type='text' value={connStr} />
      </div>

      <div class='w-full'>
        <IoTHubDeviceConnectionDisplay
          deviceKeys={props.deviceKeys}
          deviceChanged={onDeviceChange}
          resGroupLookup={props.resGroupLookup}
        />
      </div>

      <div class='w-full my-4'>
        <label
          for='connStr'
          class='block uppercase tracking-wide font-bold mb-0 text-xl'
        >
          Simulator Command
        </label>

        <p class='block text-md mb-2'>
          The simulator can be used to create and customize IoT Hub data. You will need Docker
          Desktop installed, tweak (if desired) and then run the following command.
        </p>

        <CopyInput id='simCmd' name='simCmd' type='text' value={simCmd} />
      </div>
    </>
  );
}
