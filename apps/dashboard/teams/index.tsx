import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { PageProps } from '@fathym/eac-applications/preact';
import { OpenBiotechWebState } from '@o-biotech/common/state';
import { Display, DisplayStyleTypes, Hero, HeroStyleTypes } from '@o-biotech/atomic-design-kit';
import InviteTeamMemberForm from '../../islands/organisms/team/invite-team-member.tsx';

interface TeamsPageData {
  members: string[];
}

export const handler: EaCRuntimeHandlerSet<
  OpenBiotechWebState,
  TeamsPageData
> = {
  GET: async (_req, ctx) => {
    const eacSvc = await loadEaCStewardSvc(ctx.State.EaCJWT!);

    const users = await eacSvc.Users.List(ctx.State.EaC!.EnterpriseLookup!);

    const data: TeamsPageData = {
      members: users.map((user) => user.Username),
    };

    return ctx.Render(data);
  },
};

export default function Teams({ Data }: PageProps<TeamsPageData>) {
  return (
    <>
      <Hero
        title='Manage Enterprise Teams'
        class='[&_*]:mx-auto [&>*>*]:w-full bg-hero-pattern text-center'
        heroStyle={HeroStyleTypes.None}
        displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      >
      </Hero>

      <div class='flex flex-col md:flex-row gap-4 my-8 mx-4'>
        {
          /* <Display class="flex-1 p-2 bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black">
        </Display> */
        }

        <Display class='flex-1 p-2 bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black'>
          <h2 class='text-xl'>Invite Team Member</h2>

          <InviteTeamMemberForm />
        </Display>

        <Display class='flex-1 p-2 bg-slate-50 dark:bg-slate-800 shadow-slate-500 dark:shadow-black'>
          <h2 class='text-xl'>Existing Users</h2>

          <pre>{JSON.stringify(Data.members, null, 2)}</pre>
        </Display>
      </div>
    </>
  );
}
