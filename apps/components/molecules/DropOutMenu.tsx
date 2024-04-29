import { ComponentChildren, JSX } from 'preact';
import { useState } from 'preact/hooks';
import { snakeCase } from '@case';
import { classSet } from '@o-biotech/atomic';
import { ChevronRightIcon } from '../../../build/iconset/icons/ChevronRightIcon.tsx';

export type DropOutMenuProps = {
  action?: ComponentChildren;

  children: ComponentChildren;

  storagePath: string;

  title: string;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, 'action'>;

export function DropOutMenu(props: DropOutMenuProps) {
  const getMenuOpenLocalStorage = (): boolean => {
    return JSON.parse(localStorage.getItem(props.storagePath) || 'false');
  };

  const setMenuOpenLocalStorage = (open: boolean) => {
    localStorage.setItem(props.storagePath, JSON.stringify(open));
  };

  const [menuOpen, setMenuOpen] = useState(getMenuOpenLocalStorage());

  const key = snakeCase(props.title);

  const setMenuOpenState = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    e.preventDefault();

    const open = e.currentTarget.checked;

    setMenuOpenLocalStorage(open);

    setMenuOpen(open);
  };

  return (
    <div
      {...props}
      class={classSet(['-:flex -:flex-wrap -:items-center'], props)}
      action={undefined}
    >
      <input
        type='checkbox'
        id={key}
        class='peer sr-only'
        checked={menuOpen}
        onChange={setMenuOpenState}
      />

      <label
        for={key}
        class='flex-none items-center peer-checked:font-bold cursor-pointer transition-all duration-200 peer-checked:rotate-90'
      >
        <ChevronRightIcon class='w-4 h-4' />
      </label>

      <label
        for={key}
        class='flex-1 peer-checked:font-bold cursor-pointer grow'
      >
        <span class='text-sm'>{props.title}</span>
      </label>

      {props.action && <div class='flex-none'>{props.action}</div>}

      <div class='hidden peer-checked:block bg-transparent w-full m-1'>
        {props.children}
      </div>
    </div>
  );
}
