import { IoCContainer } from '@fathym/ioc';
import { isGitHubAppSourceConnectionModifierDetails } from './GitHubAppSourceConnectionModifierDetails.ts';
import { isCurrentEaCModifierDetails } from './CurrentEaCModifierDetails.ts';
import {
  DefaultModifierMiddlewareResolver,
  ModifierHandlerResolver,
} from '@fathym/eac-applications/runtime/modifiers';
import { EaCModifierAsCode } from '@fathym/eac-applications/modifiers';

export class DefaultOpenBiotechWebModifierResolver implements ModifierHandlerResolver {
  public async Resolve(ioc: IoCContainer, modifier: EaCModifierAsCode) {
    let toResolveName: string = '';

    if (isGitHubAppSourceConnectionModifierDetails(modifier.Details)) {
      toResolveName = 'GitHubAppSourceConnectionModifierDetails';
    } else if (isCurrentEaCModifierDetails(modifier.Details)) {
      toResolveName = 'CurrentEaCModifierDetails';
    }

    let resolver = toResolveName
      ? await ioc.Resolve<ModifierHandlerResolver>(
        ioc.Symbol('ModifierHandlerResolver'),
        toResolveName,
      )
      : undefined;

    if (!resolver) {
      resolver = new DefaultModifierMiddlewareResolver();
    }

    return await resolver.Resolve(ioc, modifier);
  }
}
