import { ComponentChildren } from 'preact';
import {
  Action,
  ActionStyleTypes,
  MenuButton,
  MenuButtonProps,
  MenuButtonStyleTypes,
} from '@o-biotech/atomic';
import { UserIcon } from '../../../build/iconset/icons/UserIcon.tsx';
import { LogOutIcon } from '../../../build/iconset/icons/LogOutIcon.tsx';

// May not be necessary to be an island
export const IsIsland = true;

export type ProfileMenuProps = Omit<MenuButtonProps, 'toggleChildren'> & {
  toggleChildren?: ComponentChildren | undefined;

  username: string;
};

export default function ProfileMenu(props: ProfileMenuProps) {
  return (
    <MenuButton
      menuStyle={MenuButtonStyleTypes.Responsive}
      toggleChildren={
        <>
          <UserIcon class='w-6 h-6' />

          {/* <ChevronDownIcon class="w-[24px] h-[24px]" /> */}
        </>
      }
    >
      <div class='flex flex-col gap-4 divide-y-2 divide-gray-500 p-4'>
        <div class='text-lg min-w-40'>
          Welcome
          <div class='text-md'>{props.username}</div>
        </div>

        <div class='flex flex-row pt-4'>
          <div class='flex-1'></div>

          {
            /* <Action
            href='/signout?success_url=https://www.openbiotech.co/'
            class='flex-none ml-2'
            actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
          >
            <LogOutIcon class='w-6 h-6 inline-block' />
            Sign Out
          </Action> */
          }

          <Action
            href='/signout?success_url=https://auth.fathym.com/fathymcloudprd.onmicrosoft.com/b2c_1_sign_up_sign_in/oauth2/v2.0/logout'
            class='flex-none'
            actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
          >
            <LogOutIcon class='w-6 h-6 inline-block' />
            Sign Out
          </Action>
        </div>
      </div>
    </MenuButton>
  );
}
