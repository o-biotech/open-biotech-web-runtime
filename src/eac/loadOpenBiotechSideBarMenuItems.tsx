import { UserEaCRecord } from '@fathym/eac/api';
import { SideBarMenuItem, SideBarMenuItemSettings } from '../../apps/islands/molecules/SideBar.tsx';
import { SetupPhaseTypes } from '../state/SetupPhaseTypes.ts';
import { OpenBiotechEaC } from './OpenBiotechEaC.ts';
import { EaCCloudsDisplay } from '../../apps/components/organisms/eac/displays/EaCCloudsDisplay.tsx';
import { EaCEnterpriseDetailsDisplay } from '../../apps/components/organisms/eac/displays/EaCEnterpriseDetailsDisplay.tsx';
import { EaCDevOpsActionsDisplay } from '../../apps/components/organisms/eac/displays/EaCDevOpsActionsDisplay.tsx';
import { EaCHandlersDisplay } from '../../apps/components/organisms/eac/displays/EaCHandlersDisplay.tsx';
import { EaCIoTsDisplay } from '../../apps/components/organisms/eac/displays/EaCIoTsDisplay.tsx';
import { EaCSecretsDisplay } from '../../apps/components/organisms/eac/displays/EaCSecretsDisplay.tsx';
import { EaCSourceConnectionsDisplay } from '../../apps/components/organisms/eac/displays/EaCSourceConnectionsDisplay.tsx';
import { EaCSourcesDisplay } from '../../apps/components/organisms/eac/displays/EaCSourcesDisplay.tsx';
import { EaCGettingStartedDisplay } from '../../apps/components/organisms/eac/displays/EaCGettingStartedDisplay.tsx';
import { CloudPhaseTypes } from '../state/CloudPhaseTypes.ts';
import { DevicesPhaseTypes } from '../state/DevicesPhaseTypes.ts';
import { DataPhaseTypes } from '../state/DataPhaseTypes.ts';

export function loadOoenBiotechSideBarMenuItems(
  phase: SetupPhaseTypes,
  eac?: OpenBiotechEaC,
): SideBarMenuItem[] {
  eac = { ...(eac || {}) };

  delete eac.EnterpriseLookup;
  delete eac.ParentEnterpriseLookup;

  const eacKeys = Object.keys(eac);

  const menuItems: SideBarMenuItem[] = [];

  if (phase === SetupPhaseTypes.Complete) {
    eacKeys.forEach((key) => {
      menuItems.push({
        Name: key,
        Icon: key,
      });
    });
  } else {
    menuItems.push({
      Icon: 'GettingStarted',
      Name: 'GettingStarted',
    });

    if (eac) {
      menuItems.push({
        Icon: 'Details',
        Name: 'Details',
      });
    }
  }

  return menuItems;
}

export function loadOoenBiotechSideBarSettings(
  menuItemNames: string[],
  phase: SetupPhaseTypes,
  eac?: OpenBiotechEaC,
  cloudPhase?: CloudPhaseTypes,
  dataPhase?: DataPhaseTypes,
  devicesPhase?: DevicesPhaseTypes,
  userEaCs?: UserEaCRecord[],
): Record<string, SideBarMenuItemSettings> {
  const settings: Record<string, SideBarMenuItemSettings> = eac
    ? menuItemNames.reduce((prev, menuItemName) => {
      const data = eac![menuItemName] || {};

      switch (menuItemName) {
        case 'Clouds': {
          prev[menuItemName] = {
            Title: 'Clouds',
            Display: <EaCCloudsDisplay {...data} />,
            Order: 200,
          };
          break;
        }

        case 'Details': {
          prev[menuItemName] = {
            Title: 'Enterprise Details',
            Display: (
              <EaCEnterpriseDetailsDisplay
                {...data}
                entLookup={eac!.EnterpriseLookup!}
                userEaCs={userEaCs}
              />
            ),
            Order: 800,
          };
          break;
        }

        case 'DevOpsActions': {
          prev[menuItemName] = {
            Title: 'DevOps Actions Details',
            Display: <EaCDevOpsActionsDisplay {...data} />,
            Order: 500,
          };
          break;
        }

        case 'Handlers': {
          prev[menuItemName] = {
            Title: 'EaC Handlers',
            Display: <EaCHandlersDisplay {...data} />,
            Order: 700,
          };
          break;
        }

        case 'IoT': {
          prev[menuItemName] = {
            Title: 'IoT',
            Display: <EaCIoTsDisplay {...data} />,
            Order: 100,
          };
          break;
        }

        case 'Secrets': {
          prev[menuItemName] = {
            Title: 'Secrets',
            Display: <EaCSecretsDisplay {...data} />,
            Order: 600,
          };
          break;
        }

        case 'SourceConnections': {
          prev[menuItemName] = {
            Title: 'Source Connections',
            Display: <EaCSourceConnectionsDisplay {...data} />,
            Order: 300,
          };
          break;
        }

        case 'Sources': {
          prev[menuItemName] = {
            Title: 'Sources',
            Display: <EaCSourcesDisplay {...data} />,
            Order: 400,
          };
          break;
        }

        default: {
          prev[menuItemName] = {
            Order: 900,
          };
          break;
        }
      }

      return prev;
    }, {} as Record<string, SideBarMenuItemSettings>)
    : {};

  settings['GettingStarted'] = {
    Title: 'Getting Started',
    Display: (
      <EaCGettingStartedDisplay
        phase={phase}
        eac={eac}
        cloudPhase={cloudPhase}
        dataPhase={dataPhase}
        devicesPhase={devicesPhase}
      />
    ),
    Order: 50,
  };

  return settings;
}
