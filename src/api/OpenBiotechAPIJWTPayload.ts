export type OpenBiotechAPIJWTPayload = {
  CloudLookup: string;

  EnterpriseLookup: string;

  JWT?: string;

  ResourceGroupLookup: string;

  Username: string;
} & Record<string, unknown>;
