import { JSX } from 'preact';
import { IS_BROWSER } from '@fathym/eac/runtime/browser';
import { CopyInput } from '@o-biotech/atomic';
import { LoadingIcon } from '../../../../build/iconset/icons/LoadingIcon.tsx';

export const IsIsland = true;

export type APIDevelopFormProps = JSX.HTMLAttributes<HTMLFormElement> & {
  apiPath: string;

  jwt?: string;
};

export default function APIDevelopForm(props: APIDevelopFormProps) {
  if (!IS_BROWSER) {
    return (
      <>
        <LoadingIcon class='w-20 h-20 text-blue-500 animate-spin inline-block m-auto' />
      </>
    );
  }

  const apiPath = new URL(props.apiPath, location.origin);

  return (
    <div class='w-full p-3'>
      <div class='w-full mb-8'>
        <label
          for='connStr'
          class='block uppercase tracking-wide font-bold mb-0 text-lg'
        >
          API URL
        </label>

        <CopyInput
          id='warmApi'
          name='warmApi'
          type='text'
          value={apiPath.href}
        />
      </div>

      {props.jwt && (
        <div class='w-full mb-8'>
          <label
            for='connStr'
            class='block uppercase tracking-wide font-bold mb-0 text-lg'
          >
            API Access Token
          </label>

          <p>Set Authorization header as 'Bearer (token)'</p>

          <CopyInput
            id='jwt'
            name='jwt'
            type='text'
            class='mt-2'
            value={props.jwt}
          />
        </div>
      )}
    </div>
  );
}
