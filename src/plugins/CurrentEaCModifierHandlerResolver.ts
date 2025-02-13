import { isCurrentEaCModifierDetails } from './CurrentEaCModifierDetails.ts';
import { establishCurrentEaCMiddleware } from '../middleware/establishCurrentEaCMiddleware.ts';
import { ModifierHandlerResolver } from '@fathym/eac-applications/runtime/modifiers';
import { EaCRuntimeHandler } from '@fathym/eac/runtime/pipelines';

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
