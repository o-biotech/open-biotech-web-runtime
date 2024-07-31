import { OpenBiotechAPIJWTPayload } from './OpenBiotechAPIJWTPayload.ts';

export type OpenBiotechWebAPIState = {
  EaCJWT?: string;
} & OpenBiotechAPIJWTPayload;
