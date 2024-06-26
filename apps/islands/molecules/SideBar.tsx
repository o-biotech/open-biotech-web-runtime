import { ComponentChildren, JSX } from 'preact';
import { classSet } from '@o-biotech/atomic';
import { CloudPhaseTypes } from '../../../src/state/CloudPhaseTypes.ts';
import { DataPhaseTypes } from '../../../src/state/DataPhaseTypes.ts';
import { UserEaCRecord } from '@fathym/eac/api';
import { OpenBiotechEaC } from '../../../src/eac/OpenBiotechEaC.ts';
import { DevicesPhaseTypes } from '../../../src/state/DevicesPhaseTypes.ts';
import { SetupPhaseTypes } from '../../../src/state/SetupPhaseTypes.ts';
import SideBarMenu from './SideBarMenu.tsx';

export type SideBarMenuItem = {
  Icon: string;

  Name: string;
};

export type SideBarMenuItemSettings = {
  Display?: ComponentChildren;

  Order: number;

  Title?: string;
};

export type SideBarProps = {
  children: ComponentChildren;

  cloudPhase?: CloudPhaseTypes;

  dataPhase?: DataPhaseTypes;

  devicesPhase?: DevicesPhaseTypes;

  disableToggle?: boolean;

  eac?: OpenBiotechEaC;

  menuItems: SideBarMenuItem[];

  phase: SetupPhaseTypes;

  userEaCs?: UserEaCRecord[];
  // state: OpenBiotechWebState;
} & JSX.HTMLAttributes<HTMLDivElement>;

export default function SideBar(props: SideBarProps) {
  const { children, ...toggleProps } = props;
  return (
    <>
      <SideBarMenu {...toggleProps} />

      <div class={classSet([props.disableToggle ? 'ml-64' : 'ml-14'])}>
        {children}
      </div>
    </>
  );
}
