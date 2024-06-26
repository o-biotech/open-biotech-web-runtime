import { JSX } from 'preact';
import { useState } from 'preact/hooks';
// import { SignalLike } from "preact/signal-core";
import IoTHubKeySimulatorDisplay from '../../iot/hub-key-simulator.tsx';
import { CloudIoTForm } from '../../../../components/organisms/data/iot.form.tsx';

export const IsIsland = true;

export type ResourceGroupIoTSettingsProps = {
  action?: string | undefined; // | SignalLike<string | undefined>;

  cloudLookup: string;

  deviceKeys: Record<string, string>;

  hasGitHubAuth: boolean;

  hasStorageCold?: boolean;

  hasStorageHot?: boolean;

  hasStorageWarm?: boolean;

  iotHubKeys: Record<string, string>;

  organizations?: string[];

  resGroupLookup: string;

  stripePublishableKey: string;
} & JSX.HTMLAttributes<HTMLInputElement>;

export default function ResourceGroupIoTSettings(
  props: ResourceGroupIoTSettingsProps,
) {
  const [curResGroup, setCurResGroup] = useState(props.resGroupLookup);

  const [selectedKey, setSelectedKey] = useState('');

  const _onKeyChange = (key: string) => {
    setSelectedKey(key);
  };

  const shortName = props.resGroupLookup
    .split('-')
    .map((p) => p.charAt(0))
    .join('');

  const _connStr = selectedKey
    ? `HostName=${shortName}-iot-hub.azure-devices.net;SharedAccessKeyName=${selectedKey};SharedAccessKey=${
      props.iotHubKeys[selectedKey]
    }`
    : '';

  const _resGroupChanged = (e: JSX.TargetedEvent<HTMLSelectElement, Event>) => {
    setCurResGroup(e.currentTarget.value);
  };

  return (
    <div>
      {
        /* <div class="w-full p-3">
        <label
          for="resGroupLookup"
          class="block uppercase tracking-wide font-bold mb-2 text-lg text-left"
        >
          IoT Resource Group
        </label>

        <Select
          id="resGroupLookup"
          name="resGroupLookup"
          type="text"
          value={curResGroup}
          required
          onChange={resGroupChanged}
          placeholder="Select EaC cloud resource group"
        >
          <option value="">-- Select EaC cloud resource group --</option>
          {props.resGroupOptions.map((option) => {
            return <option value={option.Lookup}>{option.Name}</option>;
          })}
        </Select>
      </div> */
      }

      {curResGroup && (
        <>
          <CloudIoTForm
            action={props.action}
            data-eac-bypass-base
            class='px-4'
            cloudLookup={props.cloudLookup!}
            hasGitHubAuth={props.hasGitHubAuth}
            hasStorageCold={props.hasStorageCold}
            hasStorageHot={props.hasStorageHot}
            hasStorageWarm={props.hasStorageWarm}
            organizations={props.organizations}
            resGroupLookup={curResGroup}
            stripePublishableKey={props.stripePublishableKey}
          />

          <div class='my-8'>
            <div class='my-8'>
              <IoTHubKeySimulatorDisplay
                deviceKeys={props.deviceKeys}
                iotHubKeys={props.iotHubKeys}
                resGroupLookup={curResGroup}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
