import { merge } from '@fathym/common';
import { EaCUserRecord } from '@fathym/eac';
import { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { PageProps } from '@fathym/eac-applications/runtime/preact';
import { BasicLayout } from '@o-biotech/atomic-design-kit';
import { BiotechHeader } from '../components/organisms/BiotechHeader.tsx';
import { BiotechFooter } from '../components/organisms/BiotechFooter.tsx';
import SideBar from '../islands/molecules/SideBar.tsx';
import { loadOoenBiotechSideBarMenuItems } from '../../src/eac/loadOpenBiotechSideBarMenuItems.tsx';
import {
  CloudPhaseTypes,
  DataPhaseTypes,
  DevicesPhaseTypes,
  OpenBiotechWebState,
  SetupPhaseTypes,
} from '@o-biotech/common/state';
import { OpenBiotechEaC } from '@o-biotech/common/utils';

interface MainLayoutData {
  CloudLookup?: string;

  CloudPhase?: CloudPhaseTypes;

  CurrentURLPath: URL;

  DataPhase?: DataPhaseTypes;

  DevicesPhase?: DevicesPhaseTypes;

  EaC?: OpenBiotechEaC;

  Phase: SetupPhaseTypes;

  ResourceGroupLookup?: string;

  UserEaCs?: EaCUserRecord[];

  Username: string;
}

export const handler: EaCRuntimeHandlerSet<
  OpenBiotechWebState,
  MainLayoutData
> = {
  GET: (req, ctx) => {
    const data: MainLayoutData = {
      CloudLookup: ctx.State.Cloud?.CloudLookup,
      CloudPhase: ctx.State.Cloud?.Phase,
      CurrentURLPath: new URL(req.url),
      DataPhase: ctx.State.Data?.Phase,
      DevicesPhase: ctx.State.Devices?.Phase,
      EaC: ctx.State.EaC,
      Phase: ctx.State.Phase,
      ResourceGroupLookup: ctx.State.Cloud?.ResourceGroupLookup,
      Username: ctx.State.Username,
      UserEaCs: ctx.State.UserEaCs,
    };

    ctx.Data = merge(ctx.Data, data);

    return ctx.Next();
  },
};

export default function MainLayout({
  Data,
  Component,
  Revision,
}: PageProps<MainLayoutData>) {
  const menuItems = loadOoenBiotechSideBarMenuItems(Data.Phase, Data.EaC);

  return (
    <html>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />

        <title>Open Biotech</title>

        <link
          rel='shortcut icon'
          type='image/png'
          href='/assets/openBiotechFavicon.png'
          data-eac-bypass-base
        />
        <link
          rel='icon'
          href='/assets/openBiotechFavicon.png'
          data-eac-bypass-base
        />
        <link
          rel='mask-icon'
          href='/assets/openBiotechFavicon.png'
          data-eac-bypass-base
        />

        {
          /* <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
          rel="stylesheet"
        ></link> */
        }
        <link
          href='https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap'
          rel='stylesheet'
        >
        </link>

        <link
          rel='stylesheet'
          href={`/tailwind/styles.css?Revision=${Revision}`}
          data-eac-bypass-base
        />
      </head>

      <body class='bg-slate-50 dark:bg-slate-900 text-black dark:text-white font-nun'>
        <BasicLayout
          class='min-h-[100vh]'
          header={
            <BiotechHeader
              class='h-[64px]'
              currentUrl={new URL(Data.CurrentURLPath)}
              setupPhase={Data.Phase}
              hasApis={!!Data.CloudLookup && !!Data.ResourceGroupLookup}
              hasEaC={!!Data.EaC}
              username={Data.Username}
            />
          }
          footer={<BiotechFooter />}
        >
          <SideBar
            class='top-[64px] left-0'
            menuItems={menuItems}
            phase={Data.Phase}
            eac={Data.EaC}
            cloudPhase={Data.CloudPhase}
            dataPhase={Data.DataPhase}
            devicesPhase={Data.DevicesPhase}
            userEaCs={Data.UserEaCs}
            // disableToggle={true}
          >
            <Component />
          </SideBar>
        </BasicLayout>
      </body>
    </html>
  );
}
