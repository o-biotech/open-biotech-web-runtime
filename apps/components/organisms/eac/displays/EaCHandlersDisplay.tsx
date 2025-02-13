import { EaCModuleActuators } from '@fathym/eac';
import { Action, ActionStyleTypes } from '@o-biotech/atomic-design-kit';
import { EditIcon } from '../../../../../build/iconset/icons/EditIcon.tsx';
import { AddIcon } from '../../../../../build/iconset/icons/AddIcon.tsx';

export function EaCModuleActuatorsDisplay(handlers: EaCModuleActuators) {
  const actuatorLookups = Object.keys(handlers);

  return (
    <>
      {actuatorLookups.map((actuatorLookup) => (
        <Action
          actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
          class='ml-2 flex flex-row items-center text-sm text-left w-full'
          href={`./enterprises/actuators/${actuatorLookup}`}
        >
          <span class='flex-1'>{actuatorLookup}</span>

          <EditIcon class='flex-none w-4 h-4' />
        </Action>
      ))}

      <div class='ml-2 mt-2 border-b-[1px] border-dotted border-slate-400 dark:border-slate-700'>
      </div>

      <Action
        actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
        class='ml-2 flex flex-row items-center text-sm text-left w-full'
        href='./enterprises/actuators'
      >
        <span class='flex-1'>Create Handler</span>

        <AddIcon class='flex-none w-4 h-4' />
      </Action>
    </>
  );
}
