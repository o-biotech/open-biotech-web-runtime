// deno-lint-ignore-file no-explicit-any
import { useEffect, useState } from 'preact/hooks';
import { redirectRequest } from '@fathym/common';
import { EaCRuntimeHandlerResult, PageProps } from '@fathym/eac/runtime';
import { IS_BROWSER } from '@fathym/eac/runtime/browser';
import { EaCStatus, EaCStatusProcessingTypes, loadEaCSvc } from '@fathym/eac/api';
import { intlFormatDistance } from 'npm:date-fns';
import { OpenBiotechWebState } from '../../../../src/state/OpenBiotechWebState.ts';
import Redirect from '../../../islands/atoms/Redirect.tsx';
import { CheckIcon } from '../../../../build/iconset/icons/CheckIcon.tsx';
import { ErrorIcon } from '../../../../build/iconset/icons/ErrorIcon.tsx';
import { RenewIcon } from '../../../../build/iconset/icons/RenewIcon.tsx';

export const IsIsland = true;

interface CommitStatusPageData {
  commitId: string;

  complete: boolean;

  successRedirect: string;

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
        commitId,
        complete: status.Processing === EaCStatusProcessingTypes.COMPLETE,
        successRedirect,
        status,
      };

      return ctx.Render(data);
    }
  },
};

export default function CommitStatus({
  Data,
}: PageProps<CommitStatusPageData>) {
  const [complete, setComplete] = useState(Data.complete);

  const [status, setStatus] = useState(Data.status);

  const start = intlFormatDistance(new Date(status.StartTime), new Date());

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
          class={`text-lg my-2 mt-3 ml-6`}
          key={key}
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
        <div class={`text-lg my-2 ml-6`} key={key}>
          <span class={`font-bold`}>{key}:</span> {data}
        </div>
      );
    }
  };

  useEffect(() => {
    if (IS_BROWSER) {
      const checkInterval = setInterval(() => {
        fetch(`/api/o-biotech/eac/${Data.commitId}/status`).then(
          (resp: Response) => {
            resp.json().then((status) => {
              setStatus(status);

              setComplete(
                status.Processing === EaCStatusProcessingTypes.COMPLETE,
              );

              if (status.Processing === EaCStatusProcessingTypes.COMPLETE) {
                clearInterval(checkInterval);
              } else if (status.Processing === EaCStatusProcessingTypes.ERROR) {
                location.reload();
              }
            });
          },
        );
      }, 4250);
    }
  }, []);

  return (
    <div class='m-4'>
      <p class='text-lg my-2'>
        <span class='font-bold'>Started by:</span> {status.Username}
      </p>

      <p class='text-lg my-2'>
        <span class='font-bold'>Status:</span> {EaCStatusProcessingTypes[status.Processing]}
        {complete
          ? <CheckIcon class='w-6 h-6 text-green-500 inline-block ml-4' />
          : <RenewIcon class='w-6 h-6 text-blue-500 animate-spin inline-block ml-4' />}
      </p>

      <p class='text-lg my-2'>
        <span class='font-bold'>Processing since:</span> {start}
      </p>

      <p class='text-lg my-2'>
        <span class='font-bold'>Started At:</span>{' '}
        {new Date(status.StartTime).toLocaleString('en-US')}
      </p>

      <p class='text-lg my-2'>
        <span class='font-bold'>Commit ID:</span> {status.ID}
      </p>

      <div open class='text-2xl my-2 mt-6'>
        <span class='font-bold'>Messages</span>

        {complete && (
          <p class='text-lg my-2'>
            <span class='font-bold'>Complete:</span> Redirecting in 30 seconds,{' '}
            <a
              href={Data!.successRedirect}
              class='text-blue-500 underline'
              data-eac-bypass-base
            >
              click here
            </a>{' '}
            to redirect now.
          </p>
        )}

        {Object.keys(status.Messages || {}).map((messageKey) => {
          return classyPrint(messageKey, status.Messages[messageKey], 1);
        })}
      </div>

      {complete && <Redirect interval={30000} redirect={Data.successRedirect} />}
    </div>
  );
}
