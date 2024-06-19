import { JSX } from 'preact';
import { Action, ActionGroup, classSet, Input } from '@o-biotech/atomic';
import { callToActionStyles } from '../../styles/actions.tsx';

export type APIsFormProps = JSX.HTMLAttributes<HTMLFormElement> & {
  cloudLookup: string;

  resLookup?: string;

  resGroupLookup: string;
};

export function APIsForm(props: APIsFormProps) {
  return (
    <form
      method='post'
      action='/api/o-biotech/eac/iot/data-apis'
      data-eac-bypass-base
      {...props}
      class={classSet(
        ['-:w-full -:max-w-sm -:md:max-w-md -:mx-auto -:p-3 -:mt-8'],
        props,
      )}
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

        <div class='w-full px-3'>
          <label
            for='device'
            class='block uppercase tracking-wide font-bold mb-0 text-xl'
          >
            Open Biotech Data APIs
          </label>

          <p class='block text-md mb-8'>
            In order to access your data, we'll need to create your APIs.
          </p>
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
            Create Data APIs
          </Action>
        </>
      </ActionGroup>
    </form>
  );
}
