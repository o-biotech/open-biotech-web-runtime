import { JSX } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { IS_BROWSER } from '@fathym/eac/runtime/browser';
import { Action, ActionStyleTypes } from '@o-biotech/atomic';
import { RenewIcon } from '../../../../build/iconset/icons/RenewIcon.tsx';

export const IsIsland = true;

export type DashboardDisplayProps = {
  dashboardTypes: string[];

  jwt: string;

  kustoCluster: string;

  kustoLocation: string;
} & JSX.HTMLAttributes<HTMLFormElement>;

export default function DashboardDisplay(props: DashboardDisplayProps) {
  if (!IS_BROWSER) {
    return (
      <>
        <RenewIcon class='w-20 h-20 text-blue-500 animate-spin inline-block m-4' />
      </>
    );
  }

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  const [currentDashboard, setCurrentDashboard] = useState(
    props.dashboardTypes[0] || '',
  );

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
      console.log(event.data.type);
      if (
        event.data.signature === 'queryExplorer' &&
        event.data.type === 'getToken'
      ) {
        getAuthToken(event.data.scope).then();
      }
    });
  }

  const kustoQuery = props.dashboardTypes.includes('AzureDataExplorer')
    ? `https://dataexplorer.azure.com/clusters/${props.kustoCluster}.${props.kustoLocation}/databases/Telemetry?f-IFrameAuth=true&f-UseMeControl=false&workspace=<guid>&f-ShowConnectionButtons=false`
    : null;

  const kustoIframe = kustoQuery && (
    <>
      {!isLoaded && <RenewIcon class='w-20 h-20 text-blue-500 animate-spin inline-block m-4' />}

      {isLoaded && (
        <p>
          If you receive an error about failure to read 'localStorage' visit{' '}
          <Action
            class='inline-block'
            actionStyle={ActionStyleTypes.Link}
            href='https://www.chromium.org/for-testers/bug-reporting-guidelines/uncaught-securityerror-failed-to-read-the-localstorage-property-from-window-access-is-denied-for-this-document/#:~:text=This%20exception%20is%20thrown%20when,the%20fourth%20item%20under%20Cookies.'
            target='_blank'
          >
            this
          </Action>{' '}
          page to fix.
        </p>
      )}

      <iframe
        class='w-full h-[600px]'
        ref={iframeRef}
        src={kustoQuery}
      >
      </iframe>
    </>
  );

  const dashboardDisplay = currentDashboard === 'AzureDataExplorer'
    ? kustoIframe
    : currentDashboard === 'Freeboard'
    ? <div>Freeboard coming soon</div>
    : <div>No dashboards configured</div>;

  return (
    <>
      <ul class='flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400'>
        {props.dashboardTypes.some((dt) => dt === 'AzureDataExplorer') && (
          <li class='me-2'>
            <a
              onClick={() => setCurrentDashboard('AzureDataExplorer')}
              aria-current='page'
              class='inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500'
            >
              Azure Data Explorer
            </a>
          </li>
        )}

        {props.dashboardTypes.some((dt) => dt === 'Freeboard') && (
          <li class='me-2'>
            <a
              onClick={() => setCurrentDashboard('Freeboard')}
              aria-current='page'
              class='inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500'
            >
              Freeboard
            </a>
          </li>
        )}
        {
          /* <li class="me-2">
        <a
          href="#"
          class="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          Dashboard
        </a>
      </li> */
        }
      </ul>

      {dashboardDisplay}
    </>
  );
}
