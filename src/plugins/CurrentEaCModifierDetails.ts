import { EaCModifierDetails, isEaCModifierDetails } from '@fathym/eac';

export type CurrentEaCModifierDetails = EaCModifierDetails<'CurrentEaC'>;

export function isCurrentEaCModifierDetails(
  details: unknown,
): details is CurrentEaCModifierDetails {
  const x = details as CurrentEaCModifierDetails;

  return isEaCModifierDetails('CurrentEaC', x);
}
