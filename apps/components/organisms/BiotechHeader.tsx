import {
  Action,
  ActionStyleTypes,
  classSet,
  Header,
  HeaderProps,
  ResponsiveSet,
} from '@o-biotech/atomic';
import ProfileMenu from '../../islands/common/ProfileMenu.tsx';
import { SetupPhaseTypes } from '../../../src/state/SetupPhaseTypes.ts';
import { Logo } from '../atoms/Logo.tsx';

export type BiotechHeaderProps = HeaderProps & {
  currentUrl: URL;

  hasApis: boolean;

  hasEaC: boolean;

  setupPhase: SetupPhaseTypes;

  username: string;
};

export function BiotechHeader(props: BiotechHeaderProps) {
  const active = <span class='bg-slate-700 bg-opacity-80 text-white shadow-inner'></span>;

  return (
    <Header
      logo={
        <Action
          href='/'
          actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
        >
          <Logo />
        </Action>
      }
      nav={
        <>
          <div class='flex-1 md:flex-none'></div>

          <ResponsiveSet class='flex-1' toggleChildren='☰'>
            <Action
              href='/'
              actionStyle={ActionStyleTypes.Link}
              class={classSet([
                'text-lg mx-1',
                props.currentUrl.pathname === '/' ? active.props.class : '',
              ])}
            >
              Dashboard
            </Action>

            {props.hasApis && (
              <Action
                href='/apis'
                actionStyle={ActionStyleTypes.Link}
                class={classSet([
                  'text-lg mx-1',
                  props.currentUrl.pathname.startsWith('/apis') ? active.props.class : '',
                ])}
              >
                APIs
              </Action>
            )}

            {props.hasEaC && (
              <Action
                href='/teams'
                actionStyle={ActionStyleTypes.Link}
                class={classSet([
                  'text-lg mx-1',
                  props.currentUrl.pathname.startsWith('/teams') ? active.props.class : '',
                ])}
              >
                Teams
              </Action>
            )}

            <div class='flex-1'></div>

            {
              /* <Action
              class="mx-2"
              actionStyle={
                ActionStyleTypes.Link |
                ActionStyleTypes.Rounded |
                ActionStyleTypes.Icon
              }
            >
              <NotificationIcon class="w-6 h-6" />
            </Action> */
            }

            <ProfileMenu username={props.username} />
          </ResponsiveSet>
        </>
      }
      {...props}
      class={classSet(['-:z-50 -:sticky -:top-0 -:drop-shadow-md'], props)}
    />
  );
}
