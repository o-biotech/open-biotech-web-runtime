import {
  EverythingAsCode,
  EverythingAsCodeClouds,
  EverythingAsCodeGitHub,
  EverythingAsCodeIdentity,
  EverythingAsCodeIoT,
  EverythingAsCodeSources,
} from '@fathym/eac';

import {EaCWarmStorageQueryAsCode} from '@fathym/eac-azure'

export type OpenBiotechEaC =
  & EverythingAsCodeClouds
  & EverythingAsCodeGitHub
  & EverythingAsCodeIdentity
  & EverythingAsCodeIoT
  & EverythingAsCodeSources
  & EverythingAsCode
  & {WarmStorageQueries?: Record<string, EaCWarmStorageQueryAsCode>;}
