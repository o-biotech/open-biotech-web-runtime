import { JSX } from 'preact';
import { Action, ActionGroup, ActionStyleTypes, classSet, CopyInput } from '@o-biotech/atomic';
import { callToActionStyles } from '../../styles/actions.tsx';

export type APIJWTFormProps = JSX.HTMLAttributes<HTMLFormElement> & {
  jwt: string;
};

export function APIJWTForm(props: APIJWTFormProps) {
  return (
    <form
      method='post'
      action='/api/o-biotech/eac/iot/data-apis-jwt'
      data-eac-bypass-base
      {...props}
      class={classSet(
        ['-:w-full -:max-w-sm -:md:max-w-md -:mx-auto -:p-3 -:mt-8'],
        props,
      )}
    >
      <div class='flex flex-wrap -mx-3 mb-4 text-left'>
        <div class='w-full px-3'>
          <label
            for='device'
            class='block uppercase tracking-wide font-bold mb-0 text-xl'
          >
            Open Biotech Data APIs
          </label>

          <p class='block text-md mb-8'>
            Copy the following API Key for your records, in order to use it to call your data APIs.
          </p>

          <CopyInput id='jwt' name='jwt' type='text' value={props.jwt} />
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
            Move to Setup Dashboards
          </Action>

          <Action
            href='./getting-started/devices'
            class='m-2'
            actionStyle={ActionStyleTypes.Link |
              ActionStyleTypes.Outline |
              ActionStyleTypes.Rounded}
          >
            Regenerate API Key
          </Action>
        </>
      </ActionGroup>
    </form>
  );
}
