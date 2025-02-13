import { EaCWarmStorageQueryAsCode } from '@fathym/eac-azure';
import { Action, ActionStyleTypes } from '@o-biotech/atomic-design-kit';
import { EditIcon } from '../../../../../build/iconset/icons/EditIcon.tsx';
import { AddIcon } from '../../../../../build/iconset/icons/AddIcon.tsx';

export function EaCWarmQueriesDisplay(sources: Record<string, EaCWarmStorageQueryAsCode>) {
  const queries = Object.keys(sources);

  return (
    <>
      {queries.map((queryLookup) => {
        return (
          <>
            <Action
              actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
              class='ml-2 flex flex-row items-center text-sm text-left w-full'
              href={`./enterprises/iot/something/warm/query/${queryLookup}`}
            >
              <span class='flex-1'>{sources[queryLookup].Details?.Name}</span>

              <EditIcon class='flex-none w-4 h-4' />
            </Action>
          </>
        );
      })}

      <div class='ml-2 mt-2 border-b-[1px] border-dotted border-slate-400 dark:border-slate-700'>
      </div>

      <Action
        actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
        class='ml-2 flex flex-row items-center text-sm text-left w-full'
        href='./enterprises/iot/something/warm/query'
      >
        <span class='flex-1'>Create Query</span>

        <AddIcon class='flex-none w-4 h-4' />
      </Action>
    </>
  );
}
