import {
  createAzureADOAuthConfig,
  createGitHubOAuthConfig,
  createOAuthHelpers,
} from '@fathym/common/oauth';
import { UserOAuthConnection, userOAuthConnExpired } from '@fathym/eac/oauth.ts';
import { EaCRuntimeContext, EaCRuntimeHandler } from '@fathym/eac/runtime';
import { OpenBiotechWebState } from '../state/OpenBiotechWebState.ts';
import { SetupPhaseTypes } from '../state/SetupPhaseTypes.ts';
import { CloudPhaseTypes } from '../state/CloudPhaseTypes.ts';
import { DevicesPhaseTypes } from '../state/DevicesPhaseTypes.ts';
import { DataPhaseTypes } from '../state/DataPhaseTypes.ts';
import { EaCAzureADProviderDetails, loadJwtConfig } from '@fathym/eac/mod.ts';
import { loadEaCSvc } from '@fathym/eac/api';

export function establishOpenBiotechWebStateMiddleware(): EaCRuntimeHandler<OpenBiotechWebState> {
  return async (req, ctx: EaCRuntimeContext<OpenBiotechWebState>) => {
    // const isAuthenticated = ctx.state.session.get("isMsalAuthenticated");
    // Call to get state
    const state: OpenBiotechWebState = {
      UserEaCs: [],
      ...ctx.State,
      Phase: SetupPhaseTypes.Cloud,
      Cloud: {
        Phase: CloudPhaseTypes.Connect,
      },
      Devices: {
        JWT: '',
        Phase: DevicesPhaseTypes.Connect,
      },
      Data: {
        Phase: DataPhaseTypes.Flow,
      },
    };

    if (ctx.State.EaC) {
      const entLookup = ctx.State.EaC!.EnterpriseLookup!;

      const username = ctx.State.Username;

      const clouds = Object.keys(ctx.State.EaC.Clouds || {});

      if (clouds.length > 0) {
        state.Cloud.CloudLookup = clouds[0];

        state.Cloud.Phase = CloudPhaseTypes.CALZ;

        const resGroups = ctx.State.EaC!.Clouds![state.Cloud.CloudLookup].ResourceGroups || {};

        const resGroupLookups = Object.keys(resGroups);

        if (resGroupLookups.length > 0) {
          state.Cloud.ResourceGroupLookup = resGroupLookups[0];

          state.Cloud.Phase = CloudPhaseTypes.Infrastucture;

          const iotResGroup = resGroups[state.Cloud.ResourceGroupLookup!];

          if ('iot-flow' in (iotResGroup.Resources || {})) {
            const iotFlowRes = iotResGroup.Resources!['iot-flow'];

            state.Cloud.Phase = CloudPhaseTypes.Complete;

            state.Phase = SetupPhaseTypes.Devices;

            state.Cloud.Storage = {
              Cold: 'iot-flow-cold' in (iotFlowRes.Resources || {}),
              Hot: 'iot-flow-hot' in (iotFlowRes.Resources || {}),
              Warm: 'iot-flow-warm' in (iotFlowRes.Resources || {}),
            };

            const iots = Object.keys(ctx.State.EaC.IoT || {});

            if (iots.length > 0) {
              state.Devices.IoTLookup = iots[0];

              state.Devices.Phase = DevicesPhaseTypes.Connect;

              const iot = ctx.State.EaC!.IoT![state.Devices.IoTLookup!];

              const devices = iot.Devices || {};

              const deviceLookups = Object.keys(devices);

              if (deviceLookups.length > 0) {
                state.Devices.Phase = DevicesPhaseTypes.Dashboards;

                const currentJwt = await ctx.State.OBiotechKV.get<string>([
                  'User',
                  username,
                  'EaC',
                  entLookup,
                  'JWT',
                ]);

                if (currentJwt.value) {
                  state.Devices.JWT = currentJwt.value;
                } else {
                  const jwt = await loadJwtConfig().Create({
                    EnterpriseLookup: state.EaC!.EnterpriseLookup!,
                    CloudLookup: state.Cloud.CloudLookup!,
                    ResourceGroupLookup: state.Cloud.ResourceGroupLookup!,
                    Username: state.Username,
                  });

                  state.Devices.JWT = jwt;

                  await ctx.State.OBiotechKV.set(
                    ['User', username, 'EaC', entLookup, 'JWT'],
                    jwt,
                    {
                      expireIn: 1000 * 60 * 60 * 24 * 365,
                    },
                  );
                }

                const dashboards = iot.Dashboards || {};

                const dashboardLookups = Object.keys(dashboards);

                if (dashboardLookups.length > 0) {
                  state.Devices.Phase = DevicesPhaseTypes.Complete;

                  state.Phase = SetupPhaseTypes.Data;

                  const currentFlowing = await ctx.State.OBiotechKV.get<boolean>([
                    'EaC',
                    entLookup,
                    'Current',
                    'Flowing',
                  ]);

                  if (currentFlowing.value) {
                    state.Data.Phase = DataPhaseTypes.Explore;

                    const currentExplored = await ctx.State.OBiotechKV.get<boolean>([
                      'EaC',
                      entLookup,
                      'Current',
                      'Explored',
                    ]);

                    if (currentExplored.value) {
                      state.Data.Phase = DataPhaseTypes.Develop;

                      const currentDeveloped = await ctx.State.OBiotechKV.get<boolean>([
                        'EaC',
                        entLookup,
                        'Current',
                        'Developed',
                      ]);

                      console.log(currentDeveloped.value);

                      if (currentDeveloped.value) {
                        state.Data.Phase = DataPhaseTypes.Complete;
                      }
                    }
                  }
                }
              }
            } else {
              state.Devices.IoTLookup = 'iot-flow';
            }
          }
        }
      }
    }

    if (state.Data && state.Data.Phase > 2) {
      state.Phase = SetupPhaseTypes.Complete;
    }

    ctx.State = state;

    if (ctx.State.Username) {
      const parentEaCSvc = await loadEaCSvc();

      const licRes = await parentEaCSvc.GetLicense(
        ctx.Runtime.EaC.EnterpriseLookup!,
        ctx.State.Username,
        'o-biotech',
      );

      if (licRes.Active) {
        ctx.State.UserLicenses = {
          'o-biotech': licRes.License,
        };
      }
    }

    if (ctx.State.Username) {
      const providerLookup = 'o-biotech-github-app';

      const provider = ctx.Runtime.EaC!.Providers![providerLookup]!;

      const oAuthConfig = createGitHubOAuthConfig(
        provider.Details!.ClientID,
        provider.Details!.ClientSecret,
        provider.Details!.Scopes,
      );

      const helpers = createOAuthHelpers(oAuthConfig);

      const sessionId = await helpers.getSessionId(req);

      const oauthKv = await ctx.Runtime.IoC.Resolve(Deno.Kv, 'oauth');

      const currentConn = await oauthKv.get<UserOAuthConnection>([
        'OAuth',
        'User',
        sessionId!,
        providerLookup,
      ]);

      if (
        !userOAuthConnExpired(currentConn.value) &&
        state.EaC?.SourceConnections &&
        state.EaC.SourceConnections[`GITHUB://${currentConn.value?.Username}`]
      ) {
        state.GitHub = {
          Username: currentConn.value!.Username,
        };
      }
    }

    if (ctx.State.Username) {
      const providerLookup = 'azure';

      const provider = ctx.Runtime.EaC!.Providers![providerLookup]!;

      const providerDetails = provider.Details as EaCAzureADProviderDetails;

      const oAuthConfig = createAzureADOAuthConfig(
        providerDetails!.ClientID,
        providerDetails!.ClientSecret,
        providerDetails!.TenantID,
        providerDetails!.Scopes,
      );

      const helpers = createOAuthHelpers(oAuthConfig);

      const sessionId = await helpers.getSessionId(req);

      const oauthKv = await ctx.Runtime.IoC.Resolve<Deno.Kv>(
        Deno.Kv,
        provider.DatabaseLookup,
      );

      const currentAccTok = await oauthKv.get<string>([
        'MSAL',
        'Session',
        sessionId!,
        'AccessToken',
      ]);

      if (currentAccTok.value) {
        state.Cloud.AzureAccessToken = currentAccTok.value;
      }
    }

    const resp = ctx.Next();

    return resp;
  };
}
