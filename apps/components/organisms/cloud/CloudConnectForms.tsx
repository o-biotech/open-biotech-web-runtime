import { JSX } from 'preact';
import * as ArmResource from 'npm:@azure/arm-subscriptions';
import { EaCManageCloudForm } from '@o-biotech/atomic';

export type CloudConnectFormsProps = {
  subs: ArmResource.Subscription[];
} & JSX.HTMLAttributes<HTMLFormElement>;

export function CloudConnectForms(props: CloudConnectFormsProps) {
  // const [isManaged, setIsManaged] = useState(false);

  // const switchOnClick = () => {
  //   setIsManaged(!isManaged);
  // };

  return (
    <div class='flex flex-col justify-center'>
      <EaCManageCloudForm action='/api/eac/clouds' {...props} />
      {
        /* {isManaged
        ? <CloudConnectManagedForm {...props} />
        : <CloudConnectExistingForm {...props} />} */
      }

      {
        /* <ActionGroup class="flex justify-center">
        <>
          <Action
            onClick={switchOnClick}
            class="m-2"
            actionStyle={ActionStyleTypes.Outline | ActionStyleTypes.Rounded}
          >
            {isManaged ? "Use Existing" : "Create Managed"}
          </Action>
        </>
      </ActionGroup> */
      }
    </div>
  );
}
