import { loadEaCStewardSvc } from '@fathym/eac/steward/clients';
import { EaCRuntimeHandler } from '@fathym/eac/runtime/pipelines';
import { loadJwtConfig } from '@fathym/common';
import { OpenBiotechWebState } from '@o-biotech/common/state';
import { OpenBiotechEaC } from '@o-biotech/common/utils';

export function establishCurrentEaCMiddleware(): EaCRuntimeHandler<OpenBiotechWebState> {
  return async (_req, ctx) => {
    ctx.State.OBiotechKV = await ctx.Runtime.IoC.Resolve(Deno.Kv, 'o-biotech');

    const currentEntLookup = await ctx.State.OBiotechKV.get<string>([
      'User',
      ctx.State.Username!,
      'Current',
      'EnterpriseLookup',
    ]);
    let eac: OpenBiotechEaC | undefined = undefined;

    const [_header, payload] = await loadJwtConfig().Decode<{
      EnterpriseLookup: string;
    }>(Deno.env.get('EAC_API_KEY')!);

    const parentEntLookup = payload.EnterpriseLookup;

    if (currentEntLookup.value) {
      const eacSvc = await loadEaCStewardSvc(
        currentEntLookup.value,
        ctx.State.Username!,
      );

      eac = await eacSvc.EaC.Get(currentEntLookup.value);

      ctx.State.UserEaCs = await eacSvc.EaC.ListForUser(parentEntLookup);
    } else {
      let eacSvc = await loadEaCStewardSvc('', ctx.State.Username!);

      ctx.State.UserEaCs = await eacSvc.EaC.ListForUser(parentEntLookup);

      if (ctx.State.UserEaCs[0]) {
        await ctx.State.OBiotechKV.set(
          ['User', ctx.State.Username!, 'Current', 'EnterpriseLookup'],
          ctx.State.UserEaCs[0].EnterpriseLookup,
        );

        eacSvc = await loadEaCStewardSvc(
          ctx.State.UserEaCs[0].EnterpriseLookup,
          ctx.State.Username!,
        );

        eac = await eacSvc.EaC.Get(ctx.State.UserEaCs[0].EnterpriseLookup);
      }
    }

    if (eac) {
      let [{ value: currentCloudLookup }, { value: currentResGroupLookup }] = await Promise.all([
        ctx.State.OBiotechKV.get<string>([
          'User',
          ctx.State.Username!,
          'Current',
          'CloudLookup',
        ]),
        ctx.State.OBiotechKV.get<string>([
          'User',
          ctx.State.Username!,
          'Current',
          'ResourceGroupLookup',
        ]),
      ]);

      const cloudLookups = Object.keys(eac.Clouds || {});

      if (currentCloudLookup && !cloudLookups.includes(currentCloudLookup)) {
        await ctx.State.OBiotechKV.delete([
          'User',
          ctx.State.Username!,
          'Current',
          'CloudLookup',
        ]);

        currentCloudLookup = null;

        currentResGroupLookup = null;
      }

      if (!currentCloudLookup && cloudLookups.length > 0) {
        currentCloudLookup = cloudLookups[0];

        await ctx.State.OBiotechKV.set(
          ['User', ctx.State.Username!, 'Current', 'CloudLookup'],
          currentCloudLookup,
        );
      }

      if (currentCloudLookup) {
        const resGroupLookups = Object.keys(
          eac.Clouds![currentCloudLookup].ResourceGroups || {},
        );

        if (
          currentResGroupLookup &&
          !resGroupLookups.includes(currentResGroupLookup)
        ) {
          await ctx.State.OBiotechKV.delete([
            'User',
            ctx.State.Username!,
            'Current',
            'ResourceGroupLookup',
          ]);

          currentResGroupLookup = null;
        }

        if (!currentResGroupLookup && resGroupLookups.length > 0) {
          currentResGroupLookup = resGroupLookups[0];

          await ctx.State.OBiotechKV.set(
            ['User', ctx.State.Username!, 'Current', 'ResourceGroupLookup'],
            currentResGroupLookup,
          );
        }
      }

      ctx.State.CloudLookup = currentCloudLookup || undefined;

      ctx.State.ResourceGroupLookup = currentResGroupLookup || undefined;

      ctx.State.EaC = eac;

      const parentEaCSvc = await loadEaCStewardSvc();

      const jwt = await parentEaCSvc.EaC.JWT(
        eac.EnterpriseLookup!,
        ctx.State.Username!,
      );

      ctx.State.EaCJWT = jwt.Token;
    }

    const resp = ctx.Next();

    return resp;
  };
}
