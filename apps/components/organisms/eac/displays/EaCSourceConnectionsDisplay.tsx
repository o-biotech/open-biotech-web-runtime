import { EaCSourceConnectionAsCode } from '@fathym/eac';
import { Action, ActionStyleTypes } from '@o-biotech/atomic';
import { EditIcon } from '../../../../../build/iconset/icons/EditIcon.tsx';
import { AddIcon } from '../../../../../build/iconset/icons/AddIcon.tsx';

export function EaCSourceConnectionsDisplay(
  srcConns: Record<string, EaCSourceConnectionAsCode>,
) {
  const srcConnLookups = Object.keys(srcConns);

  return (
    <>
      {srcConnLookups.map((srcConnLookup) => {
        const srcConn = srcConns[srcConnLookup];

        const srcConnLookupPath = srcConnLookup.replace('://', '/');

        const managePath = `./enterprises/source-connections/${srcConnLookupPath}`;

        return (
          <>
            <Action
              actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
              class='ml-2 flex flex-row items-center text-sm text-left w-full'
              href={managePath}
            >
              <span class='flex-1'>{srcConn.Details!.Name}</span>

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
        href='./enterprises/source-connections'
      >
        <span class='flex-1'>Create Connection</span>

        <AddIcon class='flex-none w-4 h-4' />
      </Action>
    </>
  );
}
