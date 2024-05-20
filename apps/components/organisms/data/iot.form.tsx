import { JSX } from 'preact';
import { Action, ActionGroup, classSet, Input } from '@o-biotech/atomic';
import { EaCLicenseAsCode } from '@fathym/eac';
import { callToActionStyles } from '../../styles/actions.tsx';
import HotFlowInput from '../../../islands/organisms/cloud/iot/hot-flow-input.tsx';
import Licenses from '../../../islands/organisms/licensing/Licenses.tsx';
import { UserEaCLicense } from '@fathym/eac/api';

export type CloudIoTFormProps = JSX.HTMLAttributes<HTMLFormElement> & {
  cloudLookup: string;

  hasGitHubAuth: boolean;

  hasStorageCold?: boolean;

  hasStorageHot?: boolean;

  hasStorageWarm?: boolean;

  license?: EaCLicenseAsCode;

  licLookup?: string;

  organizations?: string[];

  resGroupLookup: string;

  resLookup?: string;

  stripePublishableKey: string;

  userLicense?: UserEaCLicense;
};

export function CloudIoTForm(props: CloudIoTFormProps) {
  return (
    <div class='flex flex-col justify-center'>
      {props.userLicense
        ? (
          <form
            method='post'
            {...props}
            class={classSet(
              ['-:w-full -:max-w-sm -:md:max-w-md -:mx-auto -:p-3 -:mt-8'],
              props,
            )}
            disabled={!props.license}
          >
            <div class='flex flex-wrap -mx-3 mb-4 text-left'>
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
                id='resLookup'
                name='resLookup'
                type='hidden'
                value={props.resLookup}
              />

              <div class='w-full p-3'>
                <label class='block uppercase tracking-wide font-bold mb-2 text-xl'>
                  Storage Flows
                </label>

                <p class='block text-md mb-8'>
                  Data storage flows determine how device data can be processed and accessed.
                  <br />
                  <br />{' '}
                  Cold flows enable long term storage with slower querying performance. Warm flows
                  enable shorter term storage with better querying performance. Hot flows provide
                  near real-time data (with no storage) and sync with your GitHub.
                </p>

                <div class='flex items-center mb-2'>
                  <Input
                    id='storageFlowCold'
                    name='storageFlowCold'
                    type='checkbox'
                    value='cold'
                    checked={props.hasStorageCold}
                    disabled={props.hasStorageCold}
                    class='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                  />

                  <label
                    for='storageFlowCold'
                    class='ms-2 text-sm font-medium pl-3'
                  >
                    Cold Storage
                  </label>
                </div>

                <div class='flex items-center mb-2'>
                  <Input
                    type='checkbox'
                    value='warm'
                    checked
                    disabled
                    // checked={props.hasStorageWarm}
                    // disabled={props.hasStorageWarm}
                    class='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                  />

                  <Input
                    type='hidden'
                    id='storageFlowWarm'
                    name='storageFlowWarm'
                    value='warm'
                  />

                  <label
                    for='storageFlowWarm'
                    class='ms-2 text-sm font-medium pl-3'
                  >
                    Warm Storage (required)
                  </label>
                </div>

                <div class='flex items-center mb-2'>
                  <HotFlowInput
                    id='storageFlowHot'
                    name='storageFlowHot'
                    value='hot'
                    hasGitHubAuth={props.hasGitHubAuth}
                    organizations={props.organizations}
                    checked={props.hasStorageHot}
                    disabled={props.hasStorageHot}
                    class='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                  >
                    <label
                      for='storageFlowHot'
                      class='ms-2 text-sm font-medium pl-3'
                    >
                      Hot Storage
                    </label>
                  </HotFlowInput>
                </div>
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
                  Establish IoT Infrastructure
                </Action>
              </>
            </ActionGroup>
          </form>
        )
        : (
          <div class='w-full text-center p-4 mt-8'>
            <h1 class='text-4xl font-bold m-4'>
              Select your plan to provision your cloud IoT platform.
            </h1>

            <p class='text-xl mb-4'>
              Your cloud IoT platform is just a step away, select your plan to provision your Azure
              infrastructure.
            </p>

            <Licenses
              license={props.license!}
              licLookup={props.licLookup!}
              stripePublishableKey={props.stripePublishableKey}
            />
          </div>
        )}
    </div>
  );
}
