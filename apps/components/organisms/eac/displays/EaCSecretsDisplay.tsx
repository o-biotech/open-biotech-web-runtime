import { EaCSecretAsCode } from '@fathym/eac';
import { Action, ActionStyleTypes } from '@o-biotech/atomic';
import { EditIcon } from '../../../../../build/iconset/icons/EditIcon.tsx';
import { AddIcon } from '../../../../../build/iconset/icons/AddIcon.tsx';

export function EaCSecretsDisplay(secrets: Record<string, EaCSecretAsCode>) {
  const secretLookups = Object.keys(secrets);

  return (
    <>
      {secretLookups.map((secretLookup) => {
        return (
          <>
            <Action
              actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
              class='ml-2 flex flex-row items-center text-sm text-left w-full'
              href={`./enterprises/secrets/${secretLookup}`}
            >
              <span class='flex-1'>{secretLookup}</span>

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
        href='./enterprises/secrets'
      >
        <span class='flex-1'>Create Secret</span>

        <AddIcon class='flex-none w-4 h-4' />
      </Action>
    </>
  );
}
