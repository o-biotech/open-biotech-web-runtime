import { EaCHandlers } from '@fathym/eac';
import { Action, ActionStyleTypes } from '@o-biotech/atomic';
import { EditIcon } from '../../../../../build/iconset/icons/EditIcon.tsx';
import { AddIcon } from '../../../../../build/iconset/icons/AddIcon.tsx';

export function EaCHandlersDisplay(handlers: EaCHandlers) {
  const handlerLookups = Object.keys(handlers);

  return (
    <>
      {handlerLookups.map((handlerLookup) => (
        <Action
          actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
          class='ml-2 flex flex-row items-center text-sm text-left w-full'
          href={`./enterprises/handlers/${handlerLookup}`}
        >
          <span class='flex-1'>{handlerLookup}</span>

          <EditIcon class='flex-none w-4 h-4' />
        </Action>
      ))}

      <div class='ml-2 mt-2 border-b-[1px] border-dotted border-slate-400 dark:border-slate-700'>
      </div>

      <Action
        actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
        class='ml-2 flex flex-row items-center text-sm text-left w-full'
        href='./enterprises/handlers'
      >
        <span class='flex-1'>Create Handler</span>

        <AddIcon class='flex-none w-4 h-4' />
      </Action>
    </>
  );
}
