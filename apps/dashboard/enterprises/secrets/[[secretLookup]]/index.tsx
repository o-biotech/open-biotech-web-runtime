import { redirectRequest } from '@fathym/common';
import { EaCSecretAsCode } from '@fathym/eac';
import { EaCStatusProcessingTypes, loadEaCSvc, waitForStatus } from '@fathym/eac/api';
import { EaCRuntimeHandlerResult, PageProps } from '@fathym/eac/runtime';
import {
  DataLookup,
  DisplayStyleTypes,
  EaCManageSecretForm,
  Hero,
  HeroStyleTypes,
} from '@o-biotech/atomic';
import { OpenBiotechWebState } from '../../../../../src/state/OpenBiotechWebState.ts';
import { OpenBiotechEaC } from '../../../../../src/eac/OpenBiotechEaC.ts';
import DeleteAction from '../../../../islands/molecules/DeleteAction.tsx';

export type EaCSecretsPageData = {
  cloudOptions: DataLookup[];

  entLookup: string;

  keyVaultOptions: {
    [cloudLookup: string]: DataLookup[];
  };

  manageSecret?: EaCSecretAsCode;

  manageSecretLookup?: string;
};

export const handler: EaCRuntimeHandlerResult<
  OpenBiotechWebState,
  EaCSecretsPageData
> = {
  GET(_, ctx) {
    const manageSecretLookup = ctx.Params.secretLookup;

    let manageSecret: EaCSecretAsCode | undefined = undefined;

    if (manageSecretLookup) {
      manageSecret = ctx.State.EaC!.Secrets![manageSecretLookup]!;

      if (!manageSecret) {
        return redirectRequest('/enterprises/secrets', false, false);
      }
    }

    const data: EaCSecretsPageData = {
      cloudOptions: [],
      entLookup: ctx.State.EaC!.EnterpriseLookup!,
      keyVaultOptions: {},
      manageSecret: manageSecret,
      manageSecretLookup: manageSecretLookup,
    };

    for (const cloudLookup in ctx.State.EaC!.Clouds) {
      const cloud = ctx.State.EaC!.Clouds![cloudLookup];

      data.cloudOptions.push({
        Lookup: cloudLookup,
        Name: cloud.Details!.Name!,
      });

      data.keyVaultOptions[cloudLookup] = [];

      for (const resGroupLookup in cloud.ResourceGroups) {
        const resGroup = cloud.ResourceGroups![resGroupLookup];

        const shortName = resGroupLookup
          .split('-')
          .map((p) => p.charAt(0))
          .join('');

        data.keyVaultOptions[cloudLookup].push({
          Lookup: `${shortName}-key-vault`,
          Name: resGroup.Details!.Name!,
        });
      }
    }

    return ctx.Render(data);
  },

  async POST(req, ctx) {
    const formData = await req.formData();

    const secretLookup = formData.get('secretLookup') as string;

    const saveEaC: OpenBiotechEaC = {
      EnterpriseLookup: formData.get('entLookup') as string,
      Secrets: {
        [secretLookup]: {
          Details: {
            Name: formData.get('name') as string,
            Description: formData.get('description') as string,
            Value: (formData.get('value') as string) || undefined,
          },
          CloudLookup: formData.get('cloudLookup') as string,
          KeyVaultLookup: formData.get('keyVaultLookup') as string,
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
      return redirectRequest('/enterprises/secrets', false, false);
    } else {
      return redirectRequest(
        `/enterprises/secrets?commitId=${commitResp.CommitID}`,
        false,
        false,
      );
    }
  },

  async DELETE(_req, ctx) {
    const secretLookup = ctx.Params.secretLookup!;

    const eacSvc = await loadEaCSvc(ctx.State.EaCJWT!);

    const deleteResp = await eacSvc.Delete(
      {
        EnterpriseLookup: ctx.State.EaC!.EnterpriseLookup,
        Secrets: {
          [secretLookup]: null,
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

export default function EaCSecrets({ Data }: PageProps<EaCSecretsPageData>) {
  const secretValue = Data.manageSecret?.Details?.Value?.startsWith('$secret:')
    ? ''
    : Data.manageSecret?.Details?.Value || '';
  return (
    <>
      <Hero
        title='Manage EaC Secret'
        callToAction='Configure reusable secrets to use in your system, where values are stored in a secure key vault.'
        class='[&_*]:mx-auto [&>*>*]:w-full bg-hero-pattern text-center'
        heroStyle={HeroStyleTypes.None}
        displayStyle={DisplayStyleTypes.Center | DisplayStyleTypes.Large}
      >
      </Hero>

      <EaCManageSecretForm
        entLookup={Data.entLookup}
        secretLookup={Data.manageSecretLookup || ''}
        secretName={Data.manageSecret?.Details?.Name || ''}
        secretDescription={Data.manageSecret?.Details?.Description || ''}
        secretValue={secretValue}
        secretCloudLookup={Data.manageSecret?.CloudLookup || ''}
        secretKeyVaultLookup={Data.manageSecret?.KeyVaultLookup || ''}
        cloudOptions={Data.cloudOptions}
        keyVaultOptions={Data.keyVaultOptions}
      />

      {Data.manageSecretLookup && (
        <div class='max-w-sm mx-auto mb-4'>
          <DeleteAction
            actionPath={`./secrets/${Data.manageSecretLookup}`}
            message={`Are you sure you want to delete EaC Secret '${Data.manageSecretLookup}?`}
          >
            Delete EaC Secret
          </DeleteAction>
        </div>
      )}
    </>
  );
}
