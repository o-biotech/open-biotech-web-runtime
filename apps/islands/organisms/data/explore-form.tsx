import { JSX } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { IS_BROWSER } from '@fathym/eac/runtime/browser';
import { Action, ActionGroup, classSet, Input } from '@o-biotech/atomic';
import { callToActionStyles } from '../../../components/styles/actions.tsx';
import DashboardDisplay from './dashboard-display.tsx';
import { RenewIcon } from '../../../../build/iconset/icons/RenewIcon.tsx';

export const IsIsland = true;

export type DataExploreFormProps = {
  dashboardTypes: string[];

  jwt: string;

  kustoCluster: string;

  kustoLocation: string;
} & JSX.HTMLAttributes<HTMLFormElement>;

export default function DataExploreForm(props: DataExploreFormProps) {
  if (!IS_BROWSER) return <></>;

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  if (props.dashboardTypes.includes('AzureDataExplorer')) {
    const mapScope = (scope: string) => {
      switch (scope) {
        case 'query':
          return ['https://kwetest.eastus.kusto.windows.net/.default'];
        case 'People.Read':
          return ['People.Read', 'User.ReadBasic.All', 'Group.Read.All'];
        default:
          return [scope];
      }
    };

    const postToken = (accessToken: string, scope: string) => {
      console.log(
        `[postToken] scope: ${scope}, message length(accesstoken): ${accessToken.length}`,
      );

      setIsLoaded(true);

      iframeRef.current?.contentWindow?.postMessage(
        {
          type: 'postToken',
          message: accessToken,
          scope: scope,
        },
        '*', // Not secure
      );
    };

    const getAuthToken = async (scope: string): Promise<void> => {
      const aadScopes = mapScope(scope);

      const dataUrl = `${location.origin}/api/o-biotech/data/clouds/auth-token?scope=${
        aadScopes.join(',')
      }`;

      const response = await fetch(dataUrl, {
        headers: {
          Authorization: `Bearer ${props.jwt}`,
        },
      });

      const data = await response.json();

      console.log(data);

      postToken(data.Token, scope);
    };

    self.addEventListener('message', (event) => {
      console.log(event.data);
      if (
        event.data.signature === 'queryExplorer' &&
        event.data.type === 'getToken'
      ) {
        getAuthToken(event.data.scope).then();
      }
    });
  }

  const kustoQuery = props.dashboardTypes.includes('AzureDataExplorer')
    ? `https://dataexplorer.azure.com/clusters/${props.kustoCluster}.${props.kustoLocation}/databases/Telemetry?f-IFrameAuth=true&f-UseMeControl=false&workspace=<guid>`
    : null;

  const _kustoIframe = kustoQuery && (
    <>
      {!isLoaded && <RenewIcon class='w-20 h-20 text-blue-500 animate-spin inline-block m-4' />}

      <iframe
        class='w-full h-[600px]'
        ref={iframeRef}
        src={kustoQuery}
      >
      </iframe>
    </>
  );

  return (
    <form
      method='post'
      action='/api/o-biotech/eac/data/explore'
      data-eac-bypass-base
      {...props}
      class={classSet(['-:w-full -:mx-auto -:p-3 -:mt-8'], props)}
    >
      <div class='flex flex-wrap -mx-3 mb-4 text-left'>
        <div class='w-full p-3'>
          <Input id='explored' name='explored' type='hidden' value='true' />

          <label class='block uppercase tracking-wide font-bold mb-2 text-xl'>
            Explore Data
          </label>

          <p class='block text-md mb-8'>
            Now that data is flowing into the system, this step provides initial access to the
            dashboard services configured earlier in the workflow. You can start exploring the
            device data that is now flowing into these services or continue to the next step.
          </p>

          <DashboardDisplay
            dashboardTypes={props.dashboardTypes}
            jwt={props.jwt}
            kustoCluster={props.kustoCluster}
            kustoLocation={props.kustoLocation}
          />
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
            Move to Develop Solutions
          </Action>
        </>
      </ActionGroup>
    </form>
  );
}
