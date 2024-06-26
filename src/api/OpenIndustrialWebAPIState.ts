import { OpenIndustrialAPIJWTPayload } from './OpenIndustrialAPIJWTPayload.ts';

export type OpenIndustrialWebAPIState = {
  EaCJWT?: string;
} & OpenIndustrialAPIJWTPayload;
