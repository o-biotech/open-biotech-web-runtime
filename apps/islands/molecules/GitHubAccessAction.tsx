import { useState } from 'preact/hooks';
import { Action, ActionProps, ActionStyleTypes, classSet } from '@o-biotech/atomic';
import { callToActionStyles } from '../../components/styles/actions.tsx';

// May not be necessary to be an island
export const IsIsland = true;

export default function GitHubAccessAction(props: ActionProps) {
  const [signInHref, setSignInHref] = useState('');

  const successUrl = encodeURI(location?.href || '');

  const href = `/github/oauth/signin?success_url=${successUrl}`;

  setSignInHref(href);

  return (
    <Action
      actionStyle={ActionStyleTypes.Outline | ActionStyleTypes.Link}
      {...props}
      href={signInHref}
      data-eac-bypass-base
      class={classSet(
        [
          'w-full md:w-auto text-white text-xs font-bold m-1 py-1 px-2 rounded focus:outline-none shadow-lg',
        ],
        callToActionStyles.props,
      )}
    />
  );
}
