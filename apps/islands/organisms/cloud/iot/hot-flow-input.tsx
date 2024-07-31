import { ComponentChildren } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { Action, ActionStyleTypes, Input, InputProps, Select } from '@o-biotech/atomic';
import GitHubAccessAction from '../../../molecules/GitHubAccessAction.tsx';

export const IsIsland = true;

export type HotFlowInputProps = {
  children?: ComponentChildren;

  hasGitHubAuth: boolean;

  organizations?: string[];
} & InputProps;

export default function HotFlowInput(props: HotFlowInputProps) {
  // if (!IS_BROWSER) return <></>;

  const { children, hasGitHubAuth, organizations: _orgs, ...inputProps } = props;

  const _inputRef = useRef<HTMLInputElement>(null);

  const [isChecked, setIsChecked] = useState(!!props.checked);

  const hotFlowGitHub = isChecked && hasGitHubAuth
    ? (
      <>
        <div class='w-full mb-2'>
          <label
            for='gitHubOrg'
            class='block uppercase tracking-wide font-bold mb-2 text-sm'
          >
            GitHub Organization for Devices Flow
          </label>

          <Select id='gitHubOrg' name='gitHubOrg' required>
            <option value=''>-- Select an organization --</option>

            {props.organizations?.map((org) => {
              return <option value={org}>{org}</option>;
            })}
          </Select>

          <p>
            Don't see the organization you're looking for? Add organizations by installing the{' '}
            <Action
              actionStyle={ActionStyleTypes.Link | ActionStyleTypes.Rounded}
              class='inline-block text-blue-500 hover:text-white py-0 px-1'
              href='https://github.com/apps/open-biotech-web-manager'
              target='_blank'
            >
              OpenBiotech App
            </Action>
          </p>
        </div>

        <div class='w-full'>
          <label
            for='gitHubRepo'
            class='block uppercase tracking-wide font-bold mb-2 text-sm'
          >
            New Repository Name
          </label>

          <Input
            id='gitHubRepo'
            name='gitHubRepo'
            type='text'
            required
            placeholder='Enter new repository name'
            value='open-biotech-device-flow'
          />
        </div>
      </>
    )
    : <GitHubAccessAction>Sign in to GitHub</GitHubAccessAction>;
  return (
    <div>
      <div>
        <Input
          type='checkbox'
          {...inputProps}
          checked={isChecked}
          onClick={() => setIsChecked(!isChecked)}
        />

        {children}
      </div>

      {isChecked && !props.disabled && <div class='ml-8 mt-1'>{hotFlowGitHub}</div>}
    </div>
  );
}
