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

  const explainerData = {
    Title: '',
    Descriptions: [] as string[],
    VideoURL: '',
  };

  if (!Data.HasEaC) {
    currentHero = <CreateEaCHero />;

    initialSteps = (
      <EaCManageForm
        action='/api/o-biotech/eac'
        data-eac-bypass-base
        hideTitle={true}
      />
    );
  } else {
    initialSteps = <BiotechStepsFeatures setupPhase={Data!.SetupPhase} />;

    switch (Data!.SetupPhase) {
      case SetupPhaseTypes.Cloud:
        currentHero = <CloudConnectHero />;

        explainerData.Title = 'Cloud Configuration';

        explainerData.Descriptions = [
          `Establish an Azure cloud connection so OpenBiotech can set up a complete IoT cloud infrastructure for collecting, processing, exploring and sharing device data.`,
        ];

        explainerData.VideoURL = 'https://www.youtube.com/embed/tprpd02a0mg?si=bnXDMsuj1MWdcCk4';
        break;

      case SetupPhaseTypes.Devices:
        currentHero = <ConnectDevicesHero />;

        explainerData.Title = 'Connect Devices';

        explainerData.Descriptions = [
          `Start the process of connecting a device to the cloud and configure default dashboard services for exploring device data. `,
        ];

        explainerData.VideoURL = 'https://www.youtube.com/embed/tprpd02a0mg?si=bnXDMsuj1MWdcCk4';
        break;

      case SetupPhaseTypes.Data:
        currentHero = <SetupDataHero />;

        explainerData.Title = 'Set Up Data';

        explainerData.Descriptions = [
          `Verify that data is flowing from your physical or emulated device to the cloud and view your API details and credentials.`,
        ];

        explainerData.VideoURL = 'https://www.youtube.com/embed/tprpd02a0mg?si=bnXDMsuj1MWdcCk4';
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

  const explainer = explainerData.Title
    ? (
      <div class='flex flex-col md:flex-row m-8 md:m-16'>
        <div class='md:flex-1 md:pr-[10rem]'>
          <h2 class='text-3xl font-bold'>{explainerData.Title}</h2>

          {explainerData.Descriptions.map((desc) => <p class='text-lg my-2'>{desc}</p>)}
        </div>

        <div class='md:flex-1'>
          <iframe
            class='w-full md:w-[560px] md:h-[315px]'
            // width="560"
            // height="315"
            src={explainerData.VideoURL}
            title='YouTube video player'
            frameborder='0'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
            referrerpolicy='strict-origin-when-cross-origin'
            allowFullScreen
          >
          </iframe>
        </div>
      </div>
    )
    : undefined;

  return (
    <>
      {currentHero}

      {Data.SetupPhase < 3 && initialSteps}

      {explainer}

      {Data.SetupPhase > 2
        ? <BiotechDashboard class='m-4' devices={Data.Devices!} jwt={Data.JWT!} />
        : <></>}
    </>
  );
}
