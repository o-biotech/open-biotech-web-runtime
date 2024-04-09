import { JSX } from 'preact';
import { Action, ActionGroup, classSet, Input } from '@o-biotech/atomic';
import { callToActionStyles } from '../../../styles/actions.tsx';

export default function CloudConnectManagedForm(
  props: JSX.HTMLAttributes<HTMLFormElement>,
) {
  return (
    <form
      {...props}
      class={classSet(
        ['-:w-full -:max-w-sm -:md:max-w-md -:mx-auto -:p-3 -:mt-8'],
        props,
      )}
    >
      <div class='flex flex-wrap -mx-3 mb-4'>
        <div class='w-full px-3'>
          <label
            for='subscription-name'
            class='block uppercase tracking-wide font-bold mb-2 text-xl'
          >
            New Subscription Name
          </label>

          <Input
            id='subscription-name'
            name='subscription-name'
            type='text'
            required
            placeholder='Enter new subscription name'
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
            Create Subscription
          </Action>
        </>
      </ActionGroup>
    </form>
  );
}
