import { loadEaCSvc } from '@fathym/eac/api';
import { EaCRuntimeHandler } from '@fathym/eac/runtime';
import { OpenBiotechWebState } from '../state/OpenBiotechWebState.ts';
import { OpenBiotechEaC } from '../eac/OpenBiotechEaC.ts';
import { loadJwtConfig } from '@fathym/eac/mod.ts';

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
      const eacSvc = await loadEaCSvc(
        currentEntLookup.value,
        ctx.State.Username!,
      );

      eac = await eacSvc.Get(currentEntLookup.value);

      ctx.State.UserEaCs = await eacSvc.ListForUser(parentEntLookup);
    } else {
      let eacSvc = await loadEaCSvc('', ctx.State.Username!);

      ctx.State.UserEaCs = await eacSvc.ListForUser(parentEntLookup);

      if (ctx.State.UserEaCs[0]) {
        await ctx.State.OBiotechKV.set(
          ['User', ctx.State.Username!, 'Current', 'EnterpriseLookup'],
          ctx.State.UserEaCs[0].EnterpriseLookup,
        );

        eacSvc = await loadEaCSvc(
          ctx.State.UserEaCs[0].EnterpriseLookup,
          ctx.State.Username!,
        );

        eac = await eacSvc.Get(ctx.State.UserEaCs[0].EnterpriseLookup);
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

      const parentEaCSvc = await loadEaCSvc();

      const jwt = await parentEaCSvc.JWT(
        eac.EnterpriseLookup!,
        ctx.State.Username!,
      );

      ctx.State.EaCJWT = jwt.Token;
    }

    const resp = ctx.Next();

    return resp;
  };
}
