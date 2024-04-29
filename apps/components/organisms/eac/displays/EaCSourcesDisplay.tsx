import { EaCSourceAsCode } from '@fathym/eac';
import { Action, ActionStyleTypes } from '@o-biotech/atomic';
import { DropOutMenu } from '../../../molecules/DropOutMenu.tsx';
import { EditIcon } from '../../../../../build/iconset/icons/EditIcon.tsx';
import { AddIcon } from '../../../../../build/iconset/icons/AddIcon.tsx';

export function EaCSourcesDisplay(sources: Record<string, EaCSourceAsCode>) {
  const sourceLookups = Object.keys(sources);

  return (
    <>
      {sourceLookups.map((sourceLookup) => {
        const source = sources[sourceLookup];

        const artifactLookups = Object.keys(source.Artifacts || {});

        const srcLookupPath = sourceLookup.replace('://', '/');

        const managePath = `./enterprises/sources/${srcLookupPath}`;

        return (
          <>
            <div class='ml-2'>
              <DropOutMenu
                title={source.Details!.Name!}
                class='my-1'
                storagePath={`source-sidebar-openstate-${sourceLookup}`}
                action={
                  <Action
                    actionStyle={ActionStyleTypes.Link |
                      ActionStyleTypes.Rounded |
                      ActionStyleTypes.Icon}
                    href={managePath}
                  >
                    <EditIcon class='w-4 h-4' />
                  </Action>
                }
              >
                <div class='ml-2 mt-1 uppercase text-sm'>Artifacts</div>

                <div class='ml-2 border-b-[1px] border-dotted border-slate-400 dark:border-slate-700'>
                </div>

                {artifactLookups.map((artifactLookup) => {
                  const artifact = source.Artifacts![artifactLookup];

                  return (
                    <Action
                      actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
                      class='ml-2 flex flex-row items-center text-sm text-left w-full'
                      href={`${managePath}/artifacts/${artifactLookup}`}
                    >
                      <span class='flex-1'>{artifact.Details!.Name}</span>

                      <EditIcon class='flex-none w-4 h-4' />
                    </Action>
                  );
                })}

                <div class='ml-2 mt-2 border-b-[1px] border-dotted border-slate-400 dark:border-slate-700'>
                </div>

                <Action
                  actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
                  class='ml-2 flex flex-row items-center text-sm text-left w-full'
                  href={`./enterprises/sources/${
                    encodeURIComponent(
                      sourceLookup,
                    )
                  }/artifacts`}
                >
                  <span class='flex-1'>Create Artifact</span>

                  <AddIcon class='flex-none w-4 h-4' />
                </Action>
              </DropOutMenu>
            </div>
          </>
        );
      })}

      <div class='ml-2 mt-2 border-b-[1px] border-dotted border-slate-400 dark:border-slate-700'>
      </div>

      <Action
        actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
        class='ml-2 flex flex-row items-center text-sm text-left w-full'
        href={`./enterprises/sources`}
      >
        <span class='flex-1'>Create Source</span>

        <AddIcon class='flex-none w-4 h-4' />
      </Action>
    </>
  );
}
