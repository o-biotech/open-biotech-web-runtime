import {
  EverythingAsCode,
  EverythingAsCodeClouds,
  EverythingAsCodeGitHub,
  EverythingAsCodeIdentity,
  EverythingAsCodeIoT,
  EverythingAsCodeSources,
} from '@fathym/eac';

export type OpenBiotechEaC =
  & EverythingAsCodeClouds
  & EverythingAsCodeGitHub
  & EverythingAsCodeIdentity
  & EverythingAsCodeIoT
  & EverythingAsCodeSources
  & EverythingAsCode;
