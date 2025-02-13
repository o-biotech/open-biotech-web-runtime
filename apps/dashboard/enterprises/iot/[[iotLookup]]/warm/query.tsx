import { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { PageProps } from '@fathym/eac-applications/runtime/preact';
import {
  Action,
  classSet,
  CopyInput,
  DisplayStyleTypes,
  Hero,
  HeroStyleTypes,
  Input,
} from '@o-biotech/atomic-design-kit';
import { useState } from 'preact/hooks';
import { OpenBiotechWebState } from '@o-biotech/common/state';
import { ChevronDownIcon } from '../../../../../../build/iconset/icons/ChevronDownIcon.tsx';
import { intlFormat } from 'npm:date-fns';
import { OpenBiotechEaC } from '@o-biotech/common/utils';
import { ExplorerRequest } from '@fathym/eac-azure/api';
import { EaCWarmStorageQueryAsCode } from '@fathym/eac-azure';

export const IsIsland = true;

export type EaCWarmQueryPageData = {
  JWT: string;
  Query: string;
};

export const handler: EaCRuntimeHandlerSet<
  OpenBiotechWebState,
  EaCWarmQueryPageData
> = {
  GET(req, ctx) {
    const url = new URL(req.url);

    const queryLookup = url.searchParams.get('queryLookup') ?? '';

    let query: EaCWarmStorageQueryAsCode | undefined = undefined;

    // const entLookup = ctx.State.EnterpriseLookup as string;

    // const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT!);

    const eac: OpenBiotechEaC = ctx.State.EaC!; //eacSvc.EaC.Get(entLookup);

    if (eac.WarmStorageQueries && queryLookup in eac.WarmStorageQueries) {
      query = eac.WarmStorageQueries[queryLookup];
    }

    const data: EaCWarmQueryPageData = {
      JWT: ctx.State.Devices?.JWT,
      Query: query?.Details?.Query || '',
    };

    return ctx.Render(data);
  },
};

export default function EaCWarmQuery({
  Data,
}: PageProps<EaCWarmQueryPageData>) {
  // State for modal visibility and form data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [queryName, setQueryName] = useState('');
  const [queryLookup, setQueryLookup] = useState('');
  const [query, setQuery] = useState(Data.Query);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [deviceData, setDeviceData] = useState([]);
  const [doesHaveResults, setDoesHaveResults] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const postQueryData = async () => {
    setIsLoadingData(true);

    const dataUrl = `${location.origin}/api/o-biotech/data/warm/explorer`;

    const dataReq: ExplorerRequest = {
      Query: query,
    };

    console.log(dataReq);

    const response = await fetch(dataUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Data.JWT}`,
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

      setDataLoaded(true);
      console.log(deviceData.length.toString());
      if (primaryResult.length > 0) setDoesHaveResults(true);
      else setDoesHaveResults(false);
    }, 500);
  };
  // Function to toggle modal visibility
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // deno-lint-ignore no-explicit-any
  const handleQueryLookupChange = (e: any) => {
    // Get the current input value
    const inputValue = e.target.value;

    // Regular expression to allow lowercase letters, numbers, and dashes only
    const filteredValue = inputValue.replace(/[^a-z0-9-]/g, '');

    // Set the filtered value in state
    setQueryLookup(filteredValue);
  };

  const handleQueryLookupKeyDown = (e: KeyboardEvent) => {
    // Allow only letters (a-z), numbers (0-9), and dashes (-)
    const validKeys = /^[a-z0-9-]$/;

    // Prevent default if the key pressed is not a valid key
    if (!validKeys.test(e.key)) {
      e.preventDefault();
    }
  };

  // Function to handle Save button click
  const handleSave = async () => {
    const dataUrl = `${location.origin}/api/o-biotech/eac/warm-storage/queries`;

    const dataReq = {
      lookup: queryLookup,
      name: queryName,
      query: query,
    };

    const _response = await fetch(dataUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Data.JWT}`,
      },
      body: JSON.stringify(dataReq),
    });

    setIsModalOpen(false);
  };

  return (
    <>
      <Hero
        title='Query Warm Storage'
        callToAction='Create, edit and save your KQL queries for warm storage data access'
        class='[&_*]:mx-auto [&>*>*]:w-full bg-hero-pattern text-center'
        heroStyle={HeroStyleTypes.None}
        displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      >
      </Hero>

      <form method='post' class={classSet(['-:w-full -:mx-auto -:p-3 -:mt-8'])}>
        <div class='flex flex-wrap -mx-3 mb-4'>
          <div class='w-full px-3'>
            <div class='w-full p-3'>
              <div class='flex items-center justify-between pb-4'>
                <label
                  for='query'
                  class='uppercase tracking-wide font-bold text-lg text-left'
                >
                  Query
                </label>

                <div class='flex space-x-2'>
                  <Action
                    type='button'
                    onClick={postQueryData}
                    class={`w-full md:w-auto text-white font-bold py-2 px-4 rounded focus:outline-none shadow-lg ${
                      !query ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                    disabled={!query}
                  >
                    Run
                  </Action>
                  <Action
                    onClick={toggleModal}
                    type='button'
                    class={`w-full md:w-auto text-white font-bold py-2 px-4 rounded focus:outline-none shadow-lg ${
                      !query ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                    disabled={!query} // Disable the button if there is no value in query
                  >
                    Save
                  </Action>
                </div>
              </div>

              <Input
                id='query'
                name='query'
                type='text'
                value={query}
                onInput={(e) => setQuery(e.target.value)}
                multiline
                required
                placeholder='Enter warm storage query'
                class='w-full h-64 md:h-80 resize-none'
              />
            </div>
          </div>
        </div>
      </form>

      {/* Modal */}
      {isModalOpen && (
        <div class='fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50'>
          <div class='bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full sm:w-3/4 lg:w-1/2'>
            <h2 class='text-xl font-bold mb-4'>Enter Query Details</h2>

            {/* Query Name input */}
            <div class='mb-4'>
              <label for='queryName' class='block text-lg font-semibold mb-2'>
                Query Name
              </label>
              <Input
                id='queryName'
                name='queryName'
                type='text'
                value={queryName}
                onInput={(e) => setQueryName(e.target.value)}
                required
                maxLength={25} // Limit to 25 characters
                placeholder='Enter the query name (max 25 characters)'
                class='w-full px-4 py-2 border border-gray-300 rounded-md'
              />
              <small class='text-gray-500'>Maximum 25 characters.</small>
            </div>

            {/* Query Lookup input */}
            <div class='mb-4'>
              <label for='queryLookup' class='block text-lg font-semibold mb-2'>
                Query Lookup
              </label>
              <Input
                id='queryLookup'
                name='queryLookup'
                type='text'
                value={queryLookup}
                onInput={(e) => handleQueryLookupChange(e)} // Handle input change
                onKeyDown={handleQueryLookupKeyDown} // Handle keydown to prevent invalid characters
                required
                maxLength={20} // Limit to 20 characters
                placeholder='Enter the query lookup (lowercase, numbers, dashes)'
                class='w-full px-4 py-2 border border-gray-300 rounded-md'
              />

              <small class='text-gray-500'>
                Maximum 20 characters. Only lowercase letters, numbers, and dashes are allowed (no
                spaces).
              </small>
            </div>

            {/* Modal Action Buttons */}
            <div class='flex justify-between mt-4'>
              <button
                type='button'
                onClick={handleSave}
                class={`w-auto text-white font-bold py-2 px-4 rounded ${
                  !queryName || !queryLookup
                    ? 'bg-blue-300 cursor-not-allowed opacity-50' // Disabled state
                    : 'bg-blue-500 hover:bg-blue-700' // Enabled state
                }`}
                disabled={!queryName || !queryLookup} // Disable the button if either input is empty
              >
                Save
              </button>
              <button
                type='button'
                onClick={toggleModal}
                class='w-auto text-white bg-red-500 font-bold py-2 px-4 rounded'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoadingData && (
        <div class='mx-auto ml-8 mb-[50px] inline-block p-4 bg-slate-100 dark:bg-slate-800 shadow shadow-slate-500 dark:shadow-black w-[95%]'>
          <div class='h-1.5 w-full bg-sky-100 overflow-hidden'>
            <div class='animate-progress w-full h-full bg-sky-500 origin-left-right'></div>
          </div>
        </div>
      )}
      {!isLoadingData && doesHaveResults && (
        <div class='mx-auto ml-8 h-[550px] mb-[50px] flex-1 p-4 bg-slate-100 dark:bg-slate-800 shadow shadow-slate-500 dark:shadow-black w-[95%]'>
          <div class='h-[450px]'>
            <div class='flex-1 flex flex-row p-2'>
              <div class='flex-none w-[175px] p-2 underline'>Device ID</div>

              <div class='flex-1 underline p-2'>Processed At</div>

              <div class='flex-none w-40 underline'></div>
            </div>

            <div class='flex flex-col divide-y divide-gray-300 dark:divide-gray-700 h-full relative overflow-auto overflow-y-scroll'>
              {deviceData.map(
                (dd: {
                  DeviceID: string;

                  EnqueuedTime: string;

                  MessageID: string;

                  // deno-lint-ignore no-explicit-any
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
                      <div class='flex-none w-50 p-2'>{dd.DeviceID}</div>

                      <div class='flex-1 p-2'>{enqueuedTime}</div>

                      <div class='flex-none'>
                        <CopyInput class='hidden' value={rawData} />
                      </div>

                      <input
                        id={uniqueKey}
                        type='checkbox'
                        class={`sr-only peer`}
                      />

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
        </div>
      )}
      {dataLoaded && !isLoadingData && !doesHaveResults && (
        <div class='mx-auto ml-8 mb-[50px] p-4 bg-slate-100 dark:bg-slate-800 shadow shadow-slate-500 dark:shadow-black w-[95%] inline-block items-center justify-center'>
          <div class='text-center'>
            <h3>No Results</h3>
          </div>
        </div>
      )}
    </>
  );
}
