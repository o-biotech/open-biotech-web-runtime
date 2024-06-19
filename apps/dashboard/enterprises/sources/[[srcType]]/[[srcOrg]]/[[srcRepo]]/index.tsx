import { redirectRequest } from '@fathym/common';
import { EaCSourceAsCode } from '@fathym/eac';
import { EaCStatusProcessingTypes, loadEaCSvc, waitForStatus } from '@fathym/eac/api';
import { EaCRuntimeHandlerResult, PageProps } from '@fathym/eac/runtime';
import {
  DataLookup,
  DisplayStyleTypes,
  EaCManageSourceForm,
  Hero,
  HeroStyleTypes,
} from '@o-biotech/atomic';
import { OpenBiotechWebState } from '../../../../../../../src/state/OpenBiotechWebState.ts';
import { OpenBiotechEaC } from '../../../../../../../src/eac/OpenBiotechEaC.ts';
import DeleteAction from '../../../../../../islands/molecules/DeleteAction.tsx';
import GitHubAccessAction from '../../../../../../islands/molecules/GitHubAccessAction.tsx';

export type EaCSourcesPageData = {
  entLookup: string;

  hasGitHubAuth: boolean;

  manageSrc?: EaCSourceAsCode;

  manageSrcLookup?: string;

  organizationOptions: string[];

  repositoryOptions: {
    [cloudLookup: string]: string[];
  };

  secretOptions: DataLookup[];
};

export const handler: EaCRuntimeHandlerResult<
  OpenBiotechWebState,
  EaCSourcesPageData
> = {
  async GET(_, ctx) {
    const manageSrcLookup: string = ctx.Params.srcType
      ? `${ctx.Params.srcType}://${ctx.Params.srcOrg}/${ctx.Params.srcRepo}`
      : '';

    let manageSrc: EaCSourceAsCode | undefined = undefined;

    if (manageSrcLookup) {
      manageSrc = ctx.State.EaC!.Sources![manageSrcLookup]!;

      if (!manageSrc) {
        return redirectRequest('/enterprises/sources', false, false);
      }
    }

    const data: EaCSourcesPageData = {
      entLookup: ctx.State.EaC!.EnterpriseLookup!,
      hasGitHubAuth: !!ctx.State.GitHub,
      manageSrc: manageSrc,
      manageSrcLookup: manageSrcLookup,
      organizationOptions: [],
      repositoryOptions: {},
      secretOptions: [],
    };

    if (ctx.State.GitHub && ctx.State.EaC!.SourceConnections) {
      const sourceKey = `GITHUB://${ctx.State.GitHub!.Username}`;

      if (ctx.State.EaC!.SourceConnections![sourceKey]) {
        const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

        const eacConnections = await eacSvc.Connections<OpenBiotechEaC>({
          EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup!,
          SourceConnections: {
            [sourceKey]: {},
          },
        });

        if (eacConnections.SourceConnections) {
          data.organizationOptions = Object.keys(
            eacConnections.SourceConnections[sourceKey].Organizations || {},
          );
        }
      }
    }

    for (const secretLookup in ctx.State.EaC!.Secrets) {
      const secret = ctx.State.EaC!.Secrets![secretLookup]!;

      data.secretOptions.push({
        Lookup: secretLookup,
        Name: secret.Details!.Name!,
      });
    }

    return ctx.Render(data);
  },

  async POST(req, ctx) {
    const formData = await req.formData();

    const org = formData.get('org') as string;

    const repo = formData.get('repo') as string;

    const action = formData.get('action') as string;

    const remote = formData.get('remote') as string;

    const remoteUrl = new URL(remote);

    const [remoteOrg, remoteRepo] = remoteUrl.pathname.substring(1).split('/');

    const _configuredSrcLookup = !action || action === 'configure'
      ? `GITHUB://${org}/${repo}`
      : `GITHUB://${remoteOrg}/${remoteRepo}`;

    const srcLookup = (formData.get('srcLookup') as string) || `GITHUB://${org}/${repo}`;

    const saveEaC: OpenBiotechEaC = {
      EnterpriseLookup: formData.get('entLookup') as string,
      Sources: {
        [srcLookup]: {
          Details: {
            Name: formData.get('name') as string,
            Description: formData.get('description') as string,
            Branches: ['main', 'integration'],
            MainBranch: 'integration',
            Organization: org,
            Repository: repo,
            Type: 'GITHUB',
            Username: ctx.State.GitHub!.Username,
          },
        },
      },
    };

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const commitResp = await eacSvc.Commit<OpenBiotechEaC>(saveEaC, 60);

    const status = await waitForStatus(
      eacSvc,
      commitResp.EnterpriseLookup,
      commitResp.CommitID,
    );

    if (status.Processing == EaCStatusProcessingTypes.COMPLETE) {
      return redirectRequest('/enterprises/sources', false, false);
    } else {
      return redirectRequest(
        `/enterprises/sources?commitId=${commitResp.CommitID}`,
        false,
        false,
      );
    }
  },

  async DELETE(_req, ctx) {
    const srcLookup: string = ctx.Params.srcLookup ? decodeURIComponent(ctx.Params.srcLookup) : '';

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const deleteResp = await eacSvc.Delete(
      {
        EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup,
        Sources: {
          [srcLookup]: null,
        },
      },
      false,
      60,
    );

    const status = await waitForStatus(
      eacSvc,
      deleteResp.EnterpriseLookup!,
      deleteResp.CommitID,
    );

    return Response.json(status);
  },
};

export default function EaCSources({ Data }: PageProps<EaCSourcesPageData>) {
  const activeDisplay = Data.hasGitHubAuth
    ? (
      <EaCManageSourceForm
        entLookup={Data.entLookup}
        sourceLookup={Data.manageSrcLookup || ''}
        sourceName={Data.manageSrc?.Details?.Name || ''}
        sourceDescription={Data.manageSrc?.Details?.Description || ''}
        sourceOrgnaization={Data.manageSrc?.Details?.Organization || ''}
        sourceRepository={Data.manageSrc?.Details?.Repository || ''}
        organizationOptions={Data.organizationOptions}
        // repositoryOptions={data.repositoryOptions}
        secretOptions={Data.secretOptions}
      />
    )
    : (
      <div class='max-w-sm mx-auto mb-4'>
        <h1 class='text-lg font-bold'>Connect to GitHub to continue</h1>

        <GitHubAccessAction>Sign in to GitHub</GitHubAccessAction>
      </div>
    );
  return (
    <>
      <Hero
        title='Manage EaC Sources'
        callToAction='Configure connections to source control providers to access and work with your code.'
        class='[&_*]:mx-auto [&>*>*]:w-full bg-hero-pattern text-center'
        heroStyle={HeroStyleTypes.None}
        displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      >
      </Hero>

      {activeDisplay}

      {Data.manageSrc && (
        <div class='max-w-sm mx-auto mb-4'>
          <DeleteAction
            actionPath={`./sources/${Data.manageSrcLookup}/${Data.manageSrc?.Details?.Organization}/${Data.manageSrc?.Details?.Repository}`}
            message={`Are you sure you want to delete EaC Source '${Data.manageSrcLookup}?`}
          >
            Delete EaC source
          </DeleteAction>
        </div>
      )}
    </>
  );
}
