// deno-lint-ignore-file no-explicit-any
import { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { IS_BROWSER } from '@fathym/eac/runtime/browser';
import { classSet } from '@o-biotech/atomic';
import { IconProps } from '@fathym/atomic-icons/browser';
import { RenewIcon } from '../../../../build/iconset/icons/RenewIcon.tsx';

export const IsIsland = true;

export type DeviceDataFlowingProps = {
  children: ComponentChildren;

  jwt: string;

  waitingText?: string;
} & IconProps;

export default function DeviceDataFlowing(props: DeviceDataFlowingProps) {
  const renewIcon = (
    <>
      {props.waitingText && <div class='font-bold text-lg'>{props.waitingText}</div>}

      <RenewIcon
        {...props}
        class={classSet(
          ['-:w-6 -:h-6 -:text-blue-500 -:animate-spin -:inline-block -:m-4'],
          props,
        )}
      />
    </>
  );

  if (!IS_BROWSER) return renewIcon;

  const [hasDeviceData, setHasDeviceData] = useState(false);

  useEffect(() => {
    const checkForDeviceData = async (): Promise<boolean> => {
      const dataUrl = `${location.origin}/api/o-biotech/data/warm/explorer`;

      const response = await fetch(dataUrl, {
        headers: {
          Authorization: `Bearer ${props.jwt}`,
        },
      });

      const data = await response.json();

      const json = JSON.parse(data);
      
      const primaryResult = json.tables?.find(
        (t: any) => t.name === 'PrimaryResult',
      ).data;

      const hasData = primaryResult?.length > 0;

      setHasDeviceData(hasData);

      return hasData;
    };

    const checkCall = () => {
      checkForDeviceData().then((condition) => {
        if (condition) {
          clearInterval(interval);
        }
      });
    };

    const interval = setInterval(checkCall, 30000);

    checkCall();
  }, []);

  // console.log(props.children);

  return <>{hasDeviceData ? props.children : renewIcon}</>;
  // <>
  //   <div class={!hasDeviceData ? 'hidden' : ''}>{props.children}</div>

  //   <div class={hasDeviceData ? 'hidden' : ''}>{renewIcon}</div>
  // </>
}
