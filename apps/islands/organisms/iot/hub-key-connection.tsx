import { JSX } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { CopyInput, Select } from '@o-biotech/atomic';

export const IsIsland = true;

export type IoTHubKeyConnectionDisplayProps = JSX.HTMLAttributes<HTMLSelectElement> & {
  iotHubKeys: Record<string, string>;

  keyChanged?: (key: string) => void;
};

export default function IoTHubKeyConnectionDisplay(
  props: IoTHubKeyConnectionDisplayProps,
) {
  const selectRef = useRef<HTMLSelectElement>(null);

  const keyLookups = Object.keys(props.iotHubKeys || {});

  const [selectedKey, setSelectedKey] = useState(keyLookups[0]);

  const onKeyChange = (e: JSX.TargetedEvent<HTMLSelectElement, Event>) => {
    const target = e.target! as HTMLSelectElement;

    setSelectedKey(target.value);

    if (props.keyChanged) {
      props.keyChanged(target.value);
    }
  };

  if (props.keyChanged) {
    props.keyChanged(selectedKey);
  }

  return (
    <>
      <div class='w-full'>
        <label
          for='keyLookup'
          class='block uppercase tracking-wide font-bold mb-0 text-xl'
        >
          Select IoT Hub Key
        </label>

        <p class='block text-md mb-4'>
          Select the IoT Hub key you'd like to use.
        </p>

        <Select
          id='keyLookup'
          name='keyLookup'
          required
          {...props}
          ref={selectRef}
          onChange={onKeyChange}
        >
          {keyLookups.map((keyLookup) => {
            return <option value={keyLookup}>{keyLookup}</option>;
          })}
        </Select>

        <label
          for='key'
          class='block uppercase tracking-wide font-bold mb-0 text-xl'
        >
          Key
        </label>

        {props.iotHubKeys && (
          <CopyInput
            id='key'
            name='key'
            type='text'
            class='mb-2'
            value={props.iotHubKeys[selectedKey]}
          />
        )}
      </div>
    </>
  );
}
