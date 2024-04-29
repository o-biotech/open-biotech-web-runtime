import { EaCIoTAsCode } from '@fathym/eac';
import { Action, ActionGroup, ActionStyleTypes } from '@o-biotech/atomic';
import { DropOutMenu } from '../../../molecules/DropOutMenu.tsx';
import { EditIcon } from '../../../../../build/iconset/icons/EditIcon.tsx';
import { SettingsIcon } from '../../../../../build/iconset/icons/SettingsIcon.tsx';
import { AddIcon } from '../../../../../build/iconset/icons/AddIcon.tsx';

export function EaCIoTsDisplay(iots: Record<string, EaCIoTAsCode>) {
  const iotLookups = Object.keys(iots);

  return (
    <>
      <div>
        {iotLookups.map((iotLookup) => {
          const iot = iots[iotLookup];

          const deviceLookups = Object.keys(iot.Devices || {});

          const dashboardLookups = Object.keys(iot.Dashboards || {});

          return (
            <div class='ml-2'>
              <DropOutMenu
                title={iotLookup}
                class='my-1'
                storagePath={`iot-sidebar-openstate-${iotLookup}`}
                action={
                  <ActionGroup class='flex flex-row items-center'>
                    <>
                      <Action
                        actionStyle={ActionStyleTypes.Link |
                          ActionStyleTypes.Rounded |
                          ActionStyleTypes.Icon}
                        href={`./enterprises/iot/${iotLookup}`}
                      >
                        <EditIcon class='w-4 h-4' />
                      </Action>

                      <Action
                        actionStyle={ActionStyleTypes.Link |
                          ActionStyleTypes.Rounded |
                          ActionStyleTypes.Icon}
                        class='flex-none text-sm text-left'
                        href={`./enterprises/iot/${iotLookup}/settings`}
                      >
                        <SettingsIcon class='w-4 h-4' />
                      </Action>
                    </>
                  </ActionGroup>
                }
              >
                <div class='ml-2 mt-1 uppercase text-sm'>Devices</div>

                <div class='ml-2 border-b-[1px] border-dotted border-slate-400 dark:border-slate-700'>
                </div>

                {deviceLookups.map((deviceLookup) => {
                  const device = iot.Devices![deviceLookup];

                  return (
                    <Action
                      actionStyle={ActionStyleTypes.Link |
                        ActionStyleTypes.Rounded}
                      class='ml-2 flex flex-row items-center text-sm text-left w-full'
                      href={`./enterprises/iot/${iotLookup}/devices/${deviceLookup}`}
                    >
                      <span class='flex-1'>{device.Details!.Name}</span>

                      <EditIcon class='flex-none w-4 h-4' />
                    </Action>
                  );
                })}

                <div class='ml-2 mt-2 border-b-[1px] border-dotted border-slate-400 dark:border-slate-700'>
                </div>

                <Action
                  actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
                  class='ml-2 flex flex-row items-center text-sm text-left w-full'
                  href={`./enterprises/iot/${iotLookup}/devices`}
                >
                  <span class='flex-1'>Create Device</span>

                  <AddIcon class='flex-none w-4 h-4' />
                </Action>

                <div class='ml-2 mt-4 uppercase text-sm'>Dashboards</div>

                <div class='ml-2 border-b-[1px] border-dotted border-slate-400 dark:border-slate-700'>
                </div>

                {dashboardLookups.map((dashboardLookup) => {
                  const dashboard = iot.Dashboards![dashboardLookup];

                  return (
                    <Action
                      actionStyle={ActionStyleTypes.Link |
                        ActionStyleTypes.Rounded}
                      class='ml-2 flex flex-row items-center text-sm text-left w-full'
                      href={`./enterprises/iot/${iotLookup}/dashboards/${dashboardLookup}`}
                    >
                      <span class='flex-1'>{dashboard.Details!.Name}</span>

                      <EditIcon class='flex-none w-4 h-4' />
                    </Action>
                  );
                })}

                <div class='ml-2 mt-2 border-b-[1px] border-dotted border-slate-400 dark:border-slate-700'>
                </div>

                <Action
                  actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
                  class='ml-2 flex flex-row items-center text-sm text-left w-full'
                  href={`./enterprises/iot/${iotLookup}/dashboards`}
                >
                  <span class='flex-1'>Create Dashboard</span>

                  <AddIcon class='flex-none w-4 h-4' />
                </Action>
              </DropOutMenu>
            </div>
          );
        })}

        <div class='ml-2 mt-2 border-b-[1px] border-dotted border-slate-400 dark:border-slate-700'>
        </div>

        <Action
          actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
          class='ml-2 flex flex-row items-center text-sm text-left w-full'
          href={`./enterprises/iot`}
        >
          <span class='flex-1'>Create IoT Config</span>

          <AddIcon class='flex-none w-4 h-4' />
        </Action>
      </div>
    </>
  );
}
