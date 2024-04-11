import { EaCRuntimeHandler, ModifierHandlerResolver } from '@fathym/eac/runtime';
import { isCurrentEaCModifierDetails } from './CurrentEaCModifierDetails.ts';
import { establishCurrentEaCMiddleware } from '../middleware/establishCurrentEaCMiddleware.ts';

export const CurrentEaCModifierHandlerResolver: ModifierHandlerResolver = {
  Resolve(_ioc, modifier) {
    if (!isCurrentEaCModifierDetails(modifier.Details)) {
      throw new Deno.errors.NotSupported(
        'The provided modifier is not supported for the CurrentEaCModifierHandlerResolver.',
      );
    }

    // const details = modifier.Details as CurrentEaCModifierDetails;

    return Promise.resolve(
      establishCurrentEaCMiddleware() as EaCRuntimeHandler | undefined,
    );
  },
};
