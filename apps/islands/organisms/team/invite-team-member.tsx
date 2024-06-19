import { JSX } from 'preact';
import { Action, ActionGroup, classSet, Input } from '@o-biotech/atomic';
import { callToActionStyles } from '../../../components/styles/actions.tsx';

// May not be necessary to be an island
// export const IsIsland = true;

export type InviteTeamMemberFormProps = JSX.HTMLAttributes<HTMLFormElement> & {
  username?: string;
};

export default function InviteTeamMemberForm(props: InviteTeamMemberFormProps) {
  return (
    <form
      method='post'
      action='/api/o-biotech/eac/users'
      data-eac-bypass-base
      {...props}
      class={classSet(['-:w-full -:mx-auto -:p-3 -:mt-8'], props)}
    >
      <div class='flex flex-wrap -mx-3 mb-4 text-left'>
        <div class='w-full p-3'>
          <label class='block uppercase tracking-wide font-bold mb-2 text-xl'>
            User email to invite
          </label>

          <Input
            id='username'
            name='username'
            type='text'
            placeholder='User to invite email'
            value={props.username}
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
            Invite Team Member
          </Action>
        </>
      </ActionGroup>
    </form>
  );
}
