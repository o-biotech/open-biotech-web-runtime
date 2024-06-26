import { ComponentChildren, JSX } from 'preact';
import { Action } from '@o-biotech/atomic';
import { EaCStatus } from '@fathym/eac/api';
import { DeleteIcon } from '../../../build/iconset/icons/DeleteIcon.tsx';

export const IsIsland = true;

export type DeleteActionProps = {
  actionPath: string;

  children: ComponentChildren;

  message: string;
};

export default function DeleteAction(props: DeleteActionProps) {
  const deleteAction = (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();

    if (confirm(props.message)) {
      fetch(props.actionPath || '', {
        method: 'DELETE',
      }).then((response) => {
        response.json().then((status: EaCStatus) => {
          console.log(status);
          // Why does EaCStatusProcessingTypes.COMPLETE break everything? Some issue with enums in island?
          if (status.Processing === 3) {
            location.reload();
          } else {
            console.log(status);
            alert(status.Messages['Error']);
          }
        });
      });
    }
  };

  return (
    <form onSubmit={(e) => deleteAction(e)}>
      <Action
        class='flex flex-row items-center align-center w-full bg-red-500 hover:bg-red-600'
        type='submit'
      >
        <span class='flex-none'>{props.children}</span>

        <span class='flex-1'></span>

        <DeleteIcon class='flex-none w-6 h-6 text-white' />
      </Action>
    </form>
  );
}
