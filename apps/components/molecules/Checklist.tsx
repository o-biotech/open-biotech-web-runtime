import { JSX } from 'preact';
import { Action, ActionStyleTypes, classSet } from '@o-biotech/atomic';
import { CheckIcon } from '../../../build/iconset/icons/CheckIcon.tsx';

export type ChecklistItem = {
  ActionPath: string;

  Complete: boolean;

  SubList?: ChecklistItem[];

  Title: string;
};

export type ChecklistProps = {
  items: ChecklistItem[];
} & JSX.HTMLAttributes<HTMLDivElement>;

export function Checklist(props: ChecklistProps) {
  return (
    <div {...props}>
      {props.items.map((item) => {
        const itemDisplay = item.Complete ? <h1></h1> : (
          <Action
            href={item.ActionPath}
            actionStyle={ActionStyleTypes.Link |
              ActionStyleTypes.Rounded |
              ActionStyleTypes.Icon}
          >
          </Action>
        );

        itemDisplay.props.class = classSet([
          'flex flex-row items-center text-sm px-2 py-[1px] text-left',
          item.Complete ? 'text-slate-500' : '',
        ]);

        itemDisplay.props.children = (
          <>
            <CheckIcon
              class={classSet([
                'w-4 h-4 flex-none',
                item.Complete ? 'text-green-500' : undefined,
              ])}
            />

            <span class='flex-1 ml-1'>{item.Title}</span>
          </>
        );

        return (
          <>
            {itemDisplay}

            {item.SubList && (
              <div class='ml-5'>
                <Checklist items={item.SubList!} />
              </div>
            )}
          </>
        );
      })}
    </div>
  );
}
