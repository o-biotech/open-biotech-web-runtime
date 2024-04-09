// deno-lint-ignore-file no-explicit-any
import { redirectRequest } from '@fathym/common';
import { EaCRuntimeHandlerResult, PageProps } from '@fathym/eac/runtime';
import { EaCStatus, EaCStatusProcessingTypes, loadEaCSvc } from '@fathym/eac/api';
import { intlFormatDistance } from 'npm:date-fns';
import { OpenBiotechWebState } from '../../../../src/state/OpenBiotechWebState.ts';
import Redirect from '../../../islands/atoms/Redirect.tsx';
import { CheckIcon, ErrorIcon, RenewIcon } from '$o-biotech/atomic-icons';

interface CommitStatusPageData {
  complete: boolean;

  redirect: string;

  status: EaCStatus;
}

export const handler: EaCRuntimeHandlerResult<
  OpenBiotechWebState,
  CommitStatusPageData
> = {
  GET: async (req, ctx) => {
    const entLookup = ctx.State.EaC!.EnterpriseLookup!;

    const commitId = ctx.Params.commitId!;

    const url = new URL(req.url);

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const status: EaCStatus = await eacSvc.Status(entLookup, commitId);

    const complete = (url.searchParams.get('complete') as string) === 'true';

    const successRedirect = url.searchParams.get('successRedirect') as string;

    const errorRedirect = url.searchParams.get('errorRedirect') as string;

    if (complete) {
      return redirectRequest(successRedirect, false, false);
    } else if (status.Processing === EaCStatusProcessingTypes.ERROR) {
      return redirectRequest(
        `${errorRedirect}?commitId=${commitId}`,
        false,
        false,
      );
    } else {
      const data: CommitStatusPageData = {
        complete: status.Processing === EaCStatusProcessingTypes.COMPLETE,
        redirect:
          `/dashboard/commit/${commitId}/status?successRedirect=${successRedirect}&errorRedirect=${errorRedirect}&complete=${
            status.Processing === EaCStatusProcessingTypes.COMPLETE
          }`,
        status,
      };

      return ctx.Render(data);
    }
  },
};

export default function CommitStatus({
  Data,
}: PageProps<CommitStatusPageData>) {
  const start = intlFormatDistance(
    new Date(Data!.status.StartTime),
    new Date(),
  );

  const interval = Data!.complete ? 30000 : Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;

  const classyPrint = (key: string, data: any, level: number) => {
    if (typeof data === 'object') {
      const statusIcon = data.State === 'Succeeded'
        ? <CheckIcon class='w-6 h-6 text-green-500 inline-block' />
        : data.State === 'Error'
        ? <ErrorIcon class='w-6 h-6 text-red-500 inline-block' />
        : <RenewIcon class='w-6 h-6 text-blue-500 animate-spin inline-block' />;
      return (
        <details
          open={data.State !== 'Succeeded'}
          class={`text-lg my-2 mt-3 ml-${2 * level}`}
        >
          <summary class='font-bold'>
            {statusIcon}
            {key}
          </summary>

          {Object.keys(data).map((k) => {
            return classyPrint(
              k,
              data[k] as Record<string, unknown>,
              level + 1,
            );
          })}
        </details>
      );
    } else {
      if (!isNaN(new Date(data).getTime())) {
        const date = new Date(data);

        data = `${
          intlFormatDistance(
            date,
            new Date(),
          )
        } (${date.toLocaleString()})`;
      }
      return (
        <div class={`text-lg my-2 ml-${2 * level + 2}`}>
          <span class={`font-bold ml-${2 * level}`}>{key}:</span> {data}
        </div>
      );
    }
  };

  return (
    <div class='m-4'>
      <p class='text-lg my-2'>
        <span class='font-bold'>Started by:</span> {Data!.status.Username}
      </p>

      <p class='text-lg my-2'>
        <span class='font-bold'>Status:</span> {EaCStatusProcessingTypes[Data!.status.Processing]}
        {Data!.complete
          ? <CheckIcon class='w-6 h-6 text-green-500 inline-block ml-4' />
          : <RenewIcon class='w-6 h-6 text-blue-500 animate-spin inline-block ml-4' />}
      </p>

      <p class='text-lg my-2'>
        <span class='font-bold'>Processing since:</span> {start}
      </p>

      <p class='text-lg my-2'>
        <span class='font-bold'>Started At:</span>{' '}
        {new Date(Data!.status.StartTime).toLocaleString('en-US')}
      </p>

      <p class='text-lg my-2'>
        <span class='font-bold'>Commit ID:</span> {Data!.status.ID}
      </p>

      <div open class='text-2xl my-2 mt-6'>
        <span class='font-bold'>Messages</span>

        {Data!.complete && (
          <p class='text-lg my-2'>
            <span class='font-bold'>Complete:</span> Redirecting in 30 seconds,{' '}
            <a href={Data!.redirect} class='text-blue-500 underline'>
              click here
            </a>{' '}
            to redirect now.
          </p>
        )}

        {Object.keys(Data!.status.Messages || {}).map((messageKey) => {
          return classyPrint(messageKey, Data!.status.Messages[messageKey], 1);
        })}
      </div>

      <Redirect interval={interval} redirect={Data!.redirect} />
    </div>
  );
}
