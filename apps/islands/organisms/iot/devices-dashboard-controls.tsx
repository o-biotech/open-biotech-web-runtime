// deno-lint-ignore-file no-explicit-any
import { JSX } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { IS_BROWSER } from '@fathym/eac/runtime/browser';
import { intlFormat } from 'npm:date-fns';
import {
  Action,
  classSet,
  CopyInput,
  Display,
  Input,
  InputWrapper,
  numMaxLengthShield,
  SlideToggle,
} from '@o-biotech/atomic';
import { EaCDeviceAsCode } from '@fathym/eac';
import HotConnect from './hot-connect.tsx';
import { ExplorerRequest } from '@fathym/eac/api';
import { RenewIcon } from '../../../../build/iconset/icons/RenewIcon.tsx';
import { ChevronDownIcon } from '../../../../build/iconset/icons/ChevronDownIcon.tsx';
import { IconProps } from '@fathym/atomic-icons/browser';

export const IsIsland = true;

export type DevicesDashboardControlsProps = IconProps & {
  devices: Record<string, EaCDeviceAsCode>;

  jwt: string;
};

export default function DevicesDashboardControls(props: DevicesDashboardControlsProps) {
  const renewIcon = (
    <div>
      <div class='font-bold text-lg'>Loading device data</div>

      <RenewIcon
        {...props}
        class={classSet(
          ['-:w-6 -:h-6 -:text-blue-500 -:animate-spin -:inline-block -:m-4'],
          props,
        )}
      />
    </div>
  );

  if (!IS_BROWSER) return renewIcon;

  const searchParams = new URLSearchParams(location.search);

  const initTab = searchParams.get('tab') || 'payloads';

  const customFilterRef = useRef<HTMLTextAreaElement>(null);

  const enableRefreshRef = useRef<HTMLInputElement>(null);

  const refreshRateRef = useRef<HTMLInputElement>(null);

  const takeRowsRef = useRef<HTMLInputElement>(null);

  const takeRowsEnabledRef = useRef<HTMLInputElement>(null);

  const useDescendingRef = useRef<HTMLInputElement>(null);

  const [currentFilterDisplay, setCurrentFilterDisplay] = useState('devices');

  const [currentDeviceDisplay, setCurrentDeviceDisplay] = useState(initTab);

  const [customFilter, setCustomFilter] = useState('');

  const [refresh, setRefresh] = useState({
    EnableRefresh: true,
    RefreshRate: 30,
  });

  const [settings, setSettings] = useState({
    TakeRows: 100,
    TakeRowsEnabled: true,
    UseDescending: true,
  });

  const [devices, setDevices] = useState(
    Object.keys(props.devices).map((deviceId) => {
      return {
        DeviceID: deviceId,
        Active: false,
        Details: props.devices[deviceId].Details!,
      };
    }),
  );

  const [kqlQuery, setKQLQuery] = useState('');

  const [deviceData, setDeviceData] = useState([]);

  const [isLoadingData, setIsLoadingData] = useState(false);

  const [intervalTracking, setIntervalTracking] = useState<number | undefined>(
    undefined,
  );

  const handleOnDeviceClick = (e: JSX.TargetedMouseEvent<HTMLInputElement>) => {
    const cur = devices.find((d) => d.DeviceID === e.currentTarget.id)!;

    cur.Active = !cur.Active;

    setDevices([...devices]);
  };

  const handleOnApplyCustomFilterClick = (
    _e: JSX.TargetedMouseEvent<HTMLButtonElement>,
  ) => {
    setCustomFilter(customFilterRef.current!.value);
  };

  const handleOnApplySettingsFilterClick = (
    _e: JSX.TargetedMouseEvent<HTMLButtonElement>,
  ) => {
    setRefresh({
      EnableRefresh: enableRefreshRef.current!.checked,
      RefreshRate: Number.parseInt(refreshRateRef.current!.value),
    });

    setSettings({
      TakeRows: Number.parseInt(takeRowsRef.current!.value),
      TakeRowsEnabled: takeRowsEnabledRef.current!.checked,
      UseDescending: useDescendingRef.current!.checked,
    });
  };

  const loadDeviceData = async (): Promise<void> => {
    setIsLoadingData(true);

    const dataUrl = `${location.origin}/api/o-biotech/data/warm/explorer`;

    const dataReq: ExplorerRequest = {
      Query: kqlQuery,
    };

    console.log(dataReq);

    const response = await fetch(dataUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${props.jwt}`,
      },
      body: JSON.stringify(dataReq),
    });

    const data = await response.json();

    const json = JSON.parse(data);

    const primaryResult = json.primaryResults[0].data;

    console.log(primaryResult[0]);

    setDeviceData(primaryResult);

    setTimeout(() => {
      setIsLoadingData(false);
    }, 0);
  };

  useEffect(() => {
    let query = `Devices
| order by EnqueuedTime ${settings.UseDescending ? 'desc' : 'asc'}`;

    if (!devices.every((d) => !d.Active)) {
      const activeDevices = devices.filter((d) => d.Active);

      const activeDeviceList = activeDevices
        .map((d) => `'${d.DeviceID}'`)
        .join(',');

      query = `let deviceIds = dynamic([${activeDeviceList}]);
${query}
| where DeviceID in (deviceIds)`;
    }

    if (customFilter) {
      query = `${query}
${customFilter}`;
    }

    if (settings.TakeRowsEnabled) {
      query = `${query}
| take ${settings.TakeRows}`;
    }

    setKQLQuery(query);
  }, [customFilter, devices, settings]);

  const checkCall = () => {
    loadDeviceData().then();
  };

  useEffect(() => {
    if (kqlQuery) {
      if (intervalTracking) {
        clearInterval(intervalTracking);
      }

      if (refresh.EnableRefresh) {
        setIntervalTracking(setInterval(checkCall, refresh.RefreshRate * 1000));
      }

      checkCall();
    }
  }, [refresh, kqlQuery]);

  const devicesFilterDisplay = (
    <div class='h-full relative overflow-hidden'>
      <div class='h-full relative overflow-auto'>
        {devices.map((device) => {
          return (
            <div class='flex flex-row items-center'>
              <Input
                id={device.DeviceID}
                name={device.DeviceID}
                type='checkbox'
                checked={device.Active}
                onClick={handleOnDeviceClick}
                class='flex-none mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 peer'
              />

              <label
                for={device.DeviceID}
                class='ml-2 flex-1 text-lg peer-checked:font-bold'
              >
                {device.Details.Name}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );

  const settingsFilterDisplay = (
    <div class='h-full relative overflow-hidden'>
      <div class='flex flex-col gap-2 h-full relative overflow-auto divide-y divide-gray-500'>
        <div class='flex flex-row gap-2 items-center my-2'>
          <SlideToggle
            class='after:top-[7px]'
            ref={takeRowsEnabledRef}
            checked={settings.TakeRowsEnabled}
          >
            <span class='flex-1 md:flex-none ml-2 h-[34px] leading-[34px]'>
              Use Take Rows
            </span>

            <InputWrapper
              text='rows'
              isNumber={true}
              class='w-full mt-2 md:flex-1 md:w-auto md:mt-auto hidden peer-checked:block ml-2 after:leading-[34px]'
            >
              <Input
                type='number'
                value={settings.TakeRows}
                ref={takeRowsRef}
                maxlength={6}
                onKeyPress={numMaxLengthShield}
                class='p-1'
              />
            </InputWrapper>
          </SlideToggle>
        </div>

        <div class='flex flex-row gap-2 items-center pt-2'>
          <SlideToggle
            class='after:top-[7px]'
            ref={useDescendingRef}
            checked={settings.UseDescending}
          >
            <span class='ml-2 h-[34px] leading-[34px]'>
              Use Descending Order
            </span>
          </SlideToggle>
        </div>

        <div class='flex flex-row gap-2 items-center pt-2 mb-2'>
          <SlideToggle
            class='after:top-[7px]'
            ref={enableRefreshRef}
            checked={refresh.EnableRefresh}
          >
            <span class='flex-1 md:flex-none ml-2 h-[34px] leading-[34px]'>
              Enable Auto Refresh
            </span>

            <InputWrapper
              text='sec'
              isNumber={true}
              class='w-full mt-2 md:flex-1 md:w-auto md:mt-auto hidden peer-checked:block ml-2 after:leading-[34px]'
            >
              <Input
                type='number'
                value={refresh.RefreshRate}
                ref={refreshRateRef}
                maxlength={6}
                onKeyPress={numMaxLengthShield}
                class='p-1'
              />
            </InputWrapper>
          </SlideToggle>
        </div>

        <div class='flex flex-row'>
          <div class='flex-1'></div>

          <Action class='mt-2' onClick={handleOnApplySettingsFilterClick}>
            Apply
          </Action>
        </div>
      </div>
    </div>
  );

  const customFilterDisplay = (
    <div class='h-full relative overflow-hidden'>
      <div class='h-full relative overflow-auto'>
        <div class='flex flex-col'>
          <label
            for='custom-filters'
            class='ml-2 flex-1 text-lg peer-checked:font-bold'
          >
            Custom Filters
          </label>

          <Input
            id='custom-filters'
            name='custom-filters'
            type='text'
            value={customFilter}
            ref={customFilterRef}
            multiline
          />

          <div class='flex flex-row'>
            <div class='flex-1'></div>

            <Action class='mt-2' onClick={handleOnApplyCustomFilterClick}>
              Apply
            </Action>
          </div>
        </div>
      </div>
    </div>
  );

  const aiFilterDisplay = (
    <div class='h-full relative overflow-hidden'>
      <div class='h-full relative overflow-auto'>
        <h2>Coming Soon</h2>
      </div>
    </div>
  );

  const filterDisplay = currentFilterDisplay === 'devices'
    ? devicesFilterDisplay
    : currentFilterDisplay === 'settings'
    ? settingsFilterDisplay
    : currentFilterDisplay === 'custom'
    ? customFilterDisplay
    : currentFilterDisplay === 'ai'
    ? aiFilterDisplay
    : undefined;

  const payloadsDeviceDisplay = (
    <div class='flex flex-col divide-y divide-gray-300 dark:divide-gray-700 h-full relative overflow-hidden'>
      {isLoadingData && (
        <div class='w-full'>
          <div class='h-1.5 w-full bg-sky-100 overflow-hidden'>
            <div class='animate-progress w-full h-full bg-sky-500 origin-left-right'></div>
          </div>
        </div>
      )}

      <div class='flex-1 flex flex-row p-2'>
        <div class='flex-none w-40 underline'>Device ID</div>

        <div class='flex-1 underline'>Processed At</div>

        <div class='flex-none w-40 underline'></div>
      </div>

      <div class='flex flex-col divide-y divide-gray-300 dark:divide-gray-700 h-full relative overflow-auto'>
        {deviceData.map(
          (dd: {
            DeviceID: string;

            EnqueuedTime: string;

            MessageID: string;

            RawData: any;
          }) => {
            const enqueuedTime = intlFormat(
              new Date(Date.parse(dd.EnqueuedTime)),
              {
                timeZoneName: 'longOffset',
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                fractionalSecondDigits: 3,
              } as Intl.DateTimeFormatOptions,
            );

            const rawData = JSON.stringify(dd.RawData, null, 2);

            const uniqueKey = dd.DeviceID + Date.parse(dd.EnqueuedTime); //createHash('md5').update(dd.DeviceID + dd.EnqueuedTime).digest("hex");

            return (
              <div
                class='flex-1 flex flex-wrap items-center p-2'
                key={uniqueKey}
              >
                <div class='flex-none w-40'>{dd.DeviceID}</div>

                <div class='flex-1'>{enqueuedTime}</div>

                <div class='flex-none'>
                  <CopyInput class='hidden' value={rawData} />
                </div>

                <input id={uniqueKey} type='checkbox' class={`sr-only peer`} />

                <label
                  for={uniqueKey}
                  class={`cursor-pointer transition-all duration-200 peer-checked:rotate-[-180deg]`}
                >
                  <ChevronDownIcon class='w-6 h-6' />
                </label>

                <div
                  class={`hidden peer-checked:block w-full m-2 p-2 shadow shadow-inner bg-gray-200 dark:bg-gray-700`}
                >
                  <pre>{rawData}</pre>
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );

  const streamingDeviceDisplay = <HotConnect jwt={props.jwt} takeRows={settings.TakeRows} />;

  const rawDeviceDisplay = (
    <div class='h-full relative overflow-hidden'>
      <div class='h-full relative overflow-auto'>
        <pre>{JSON.stringify(deviceData, null, 2)}</pre>
      </div>
    </div>
  );

  const queryDeviceDisplay = (
    <div class='h-full relative overflow-hidden'>
      <div class='h-full relative overflow-auto'>
        <pre>{kqlQuery}</pre>
      </div>
    </div>
  );

  const deviceDisplay = currentDeviceDisplay === 'raw'
    ? rawDeviceDisplay
    : currentDeviceDisplay === 'payloads'
    ? payloadsDeviceDisplay
    : currentDeviceDisplay === 'streaming'
    ? streamingDeviceDisplay
    : currentDeviceDisplay === 'query'
    ? queryDeviceDisplay
    : undefined;

  return (
    <div class='flex flex-col gap-4 divide-y-4 divide-[#4a918e]'>
      <h1 class='text-4xl'>Device Data</h1>

      <div class='flex flex-col md:flex-row gap-4 pt-4 relative'>
        <Display class='md:w-[25%] md:flex-none p-4 bg-slate-50 dark:bg-slate-800 shadow shadow-slate-500 dark:shadow-black'>
          <h1 class='text-2xl mb-1'>Filters</h1>

          <ul class='flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400'>
            <li class='me-2'>
              <a
                onClick={() => setCurrentFilterDisplay('devices')}
                aria-current='page'
                class={classSet([
                  'inline-block p-2 rounded-t-lg cursor-pointer',
                  currentFilterDisplay === 'devices'
                    ? 'active bg-gray-700 dark:bg-gray-300 text-blue-300 dark:text-blue-700'
                    : 'bg-gray-300 dark:bg-gray-700 text-blue-700 dark:text-blue-300',
                ])}
              >
                Devices
              </a>
            </li>

            <li class='me-2'>
              <a
                onClick={() => setCurrentFilterDisplay('settings')}
                aria-current='page'
                class={classSet([
                  'inline-block p-2 rounded-t-lg cursor-pointer',
                  currentFilterDisplay === 'settings'
                    ? 'active bg-gray-700 dark:bg-gray-300 text-blue-300 dark:text-blue-700'
                    : 'bg-gray-300 dark:bg-gray-700 text-blue-700 dark:text-blue-300',
                ])}
              >
                Settings
              </a>
            </li>

            <li class='me-2'>
              <a
                onClick={() => setCurrentFilterDisplay('custom')}
                aria-current='page'
                class={classSet([
                  'inline-block p-2 rounded-t-lg cursor-pointer',
                  currentFilterDisplay === 'custom'
                    ? 'active bg-gray-700 dark:bg-gray-300 text-blue-300 dark:text-blue-700'
                    : 'bg-gray-300 dark:bg-gray-700 text-blue-700 dark:text-blue-300',
                ])}
              >
                Custom
              </a>
            </li>

            {
              /* <li class="me-2">
              <a
                onClick={() => setCurrentFilterDisplay('ai')}
                aria-current="page"
                class={classSet([
                  'inline-block p-2 rounded-t-lg cursor-pointer',
                  currentFilterDisplay === 'ai'
                    ? 'active bg-gray-700 dark:bg-gray-300 text-blue-300 dark:text-blue-700'
                    : 'bg-gray-300 dark:bg-gray-700 text-blue-700 dark:text-blue-300',
                ])}
              >
                Thinky
              </a>
            </li> */
            }
          </ul>

          {filterDisplay}
        </Display>

        <Display class='flex-1 p-4 bg-slate-100 dark:bg-slate-800 shadow shadow-slate-500 dark:shadow-black'>
          <ul class='flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400'>
            <li class='me-2'>
              <a
                onClick={() => setCurrentDeviceDisplay('payloads')}
                aria-current='page'
                class={classSet([
                  'inline-block p-4 rounded-t-lg cursor-pointer',
                  currentDeviceDisplay === 'payloads'
                    ? 'active bg-gray-700 dark:bg-gray-300 text-blue-300 dark:text-blue-700'
                    : 'bg-gray-300 dark:bg-gray-700 text-blue-700 dark:text-blue-300',
                ])}
              >
                Payloads
              </a>
            </li>

            <li class='me-2'>
              <a
                onClick={() => setCurrentDeviceDisplay('streaming')}
                aria-current='page'
                class={classSet([
                  'inline-block p-4 rounded-t-lg cursor-pointer',
                  currentDeviceDisplay === 'streaming'
                    ? 'active bg-gray-700 dark:bg-gray-300 text-blue-300 dark:text-blue-700'
                    : 'bg-gray-300 dark:bg-gray-700 text-blue-700 dark:text-blue-300',
                ])}
              >
                Streaming
              </a>
            </li>

            <li class='me-2'>
              <a
                onClick={() => setCurrentDeviceDisplay('raw')}
                aria-current='page'
                class={classSet([
                  'inline-block p-4 rounded-t-lg cursor-pointer',
                  currentDeviceDisplay === 'raw'
                    ? 'active bg-gray-700 dark:bg-gray-300 text-blue-300 dark:text-blue-700'
                    : 'bg-gray-300 dark:bg-gray-700 text-blue-700 dark:text-blue-300',
                ])}
              >
                Raw JSON
              </a>
            </li>

            <li class='me-2'>
              <a
                onClick={() => setCurrentDeviceDisplay('query')}
                aria-current='page'
                class={classSet([
                  'inline-block p-4 rounded-t-lg cursor-pointer',
                  currentDeviceDisplay === 'query'
                    ? 'active bg-gray-700 dark:bg-gray-300 text-blue-300 dark:text-blue-700'
                    : 'bg-gray-300 dark:bg-gray-700 text-blue-700 dark:text-blue-300',
                ])}
              >
                Current Query
              </a>
            </li>
          </ul>

          <div class='m-2 h-[450px]'>{deviceDisplay}</div>
        </Display>
      </div>
    </div>
  );
}
