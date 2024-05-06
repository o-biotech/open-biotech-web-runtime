import { JSX } from 'preact';
import { Action, ActionGroup, classSet, Input } from '@o-biotech/atomic';
import { callToActionStyles } from '../../styles/actions.tsx';

export type DataDevelopFormProps = JSX.HTMLAttributes<HTMLFormElement>;

export function DataDevelopForm(props: DataDevelopFormProps) {
  return (
    <form
      method='post'
      action='/api/o-biotech/eac/data/develop'
      data-eac-bypass-base
      {...props}
      class={classSet(
        ['-:w-full -:max-w-sm -:md:max-w-md -:mx-auto -:p-3 -:mt-8'],
        props,
      )}
    >
      <Input id='developed' name='developed' type='hidden' value='true' />

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
            Complete Getting Started Setup
          </Action>
        </>
      </ActionGroup>
    </form>
  );
}
