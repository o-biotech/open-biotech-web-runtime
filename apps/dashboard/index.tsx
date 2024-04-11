import { JSX } from 'preact';
import { EaCDeviceAsCode } from '@fathym/eac';
import { UserEaCRecord } from '@fathym/eac/api';
import { EaCRuntimeHandlerResult, PageProps } from '@fathym/eac/runtime';
import { EaCManageForm } from '@o-biotech/atomic';
import { SetupPhaseTypes } from '../../src/state/SetupPhaseTypes.ts';
import CloudConnectHero from '../components/organisms/heros/CloudConnectHero.tsx';
import ConnectDevicesHero from '../components/organisms/heros/ConnectDevicesHero.tsx';
import CreateEaCHero from '../components/organisms/heros/CreateEaCHero.tsx';
import SetupDataHero from '../components/organisms/heros/SetupDataHero.tsx';
import { BiotechStepsFeatures } from '../components/organisms/features/BiotechStepsFeatures.tsx';
import { OpenBiotechWebState } from '../../src/state/OpenBiotechWebState.ts';
import { BiotechDashboard } from '../components/organisms/BiotechDashboard.tsx';

interface HomePageData {
  Devices?: Record<string, EaCDeviceAsCode>;

  HasEaC: boolean;

  JWT?: string;

  SetupPhase: SetupPhaseTypes;

  UserEaCs?: UserEaCRecord[];
}

export const handler: EaCRuntimeHandlerResult<
  OpenBiotechWebState,
  HomePageData
> = {
  GET: (_req, ctx) => {
    const data: HomePageData = {
      Devices: ctx.State.EaC?.IoT ? ctx.State.EaC.IoT!['iot-flow']!.Devices! : undefined,
      HasEaC: !!ctx.State.EaC,
      JWT: ctx.State.Devices?.JWT,
      SetupPhase: ctx.State.Phase,
      UserEaCs: ctx.State.UserEaCs,
    };

    return ctx.Render(data);
  },
};

export default function Index({ Data }: PageProps<HomePageData>) {
  let currentHero: JSX.Element | undefined = undefined;

  let initialSteps: JSX.Element | undefined = undefined;

  if (!Data.HasEaC) {
    currentHero = <CreateEaCHero isFirst={Data.UserEaCs!.length > 0} />;

    initialSteps = <EaCManageForm action='/api/o-biotech/eac' data-eac-bypass-base />;
  } else {
    initialSteps = <BiotechStepsFeatures setupPhase={Data!.SetupPhase} />;

    switch (Data!.SetupPhase) {
      case SetupPhaseTypes.Cloud:
        currentHero = <CloudConnectHero />;
        break;

      case SetupPhaseTypes.Devices:
        currentHero = <ConnectDevicesHero />;
        break;

      case SetupPhaseTypes.Data:
        currentHero = <SetupDataHero />;
        break;

      case SetupPhaseTypes.Complete:
        currentHero = (
          <>
            <div class='flex flex-col md:flex-row items-start md:items-center divide-y-4 md:divide-x-4 md:divide-y-0 divide-[#4a918e]'>
              <div class='flex-none md:w-100 px-5 py-10 mx-5 md:py-10 md:px-20 md:my-10 text-2xl md:text-3xl'>
                <h1 class='text-[#4a918e]'>Welcome to</h1>

                <h1 class=''>Open Biotech</h1>
              </div>

              <div class='flex-1 px-5 py-10 mx-5 md:py-10 md:px-20 md:my-10'>
                <h2 class='text-xl md:text-2xl text-[#4a918e]'>
                  Device Data Dashboard
                </h2>

                <h3 class='md:text-lg'>
                  Stream, view and query your device data.
                </h3>
              </div>
            </div>
          </>
        );
        break;
    }
  }

  return (
    <>
      {currentHero}

      {Data.SetupPhase < 3 && initialSteps}

      {Data.SetupPhase > 2
        ? <BiotechDashboard class='m-4' devices={Data.Devices!} jwt={Data.JWT!} />
        : <></>}
    </>
  );
}
