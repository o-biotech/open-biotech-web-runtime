import { ComponentChildren, JSX } from 'preact';
import { classSet } from '@o-biotech/atomic-design-kit';
import { EaCUserRecord } from '@fathym/eac';
import { OpenBiotechEaC } from '@o-biotech/common/utils';
import SideBarMenu from './SideBarMenu.tsx';
import {
  CloudPhaseTypes,
  DataPhaseTypes,
  DevicesPhaseTypes,
  SetupPhaseTypes,
} from '@o-biotech/common/state';

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

  userEaCs?: EaCUserRecord[];
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
