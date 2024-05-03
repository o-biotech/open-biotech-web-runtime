import { DefaultAtomicIconsProcessorHandlerResolver } from '@fathym/atomic-icons/plugin';
import {
  DefaultProcessorHandlerResolver,
  EaCApplicationProcessorConfig,
  EaCRuntimeEaC,
  ProcessorHandlerResolver,
} from '@fathym/eac/runtime';
import { DefaultMSALProcessorHandlerResolver } from '@fathym/msal';
import { IoCContainer } from '@fathym/ioc';

export class DefaultOpenBiotechWebProcessorHandlerResolver implements ProcessorHandlerResolver {
  public async Resolve(
    ioc: IoCContainer,
    appProcCfg: EaCApplicationProcessorConfig,
    eac: EaCRuntimeEaC,
  ) {
    const atomicIconsResolver = new DefaultAtomicIconsProcessorHandlerResolver();

    let resolver = await atomicIconsResolver.Resolve(ioc, appProcCfg, eac);

    if (!resolver) {
      const defaultResolver = new DefaultMSALProcessorHandlerResolver();

      resolver = await defaultResolver.Resolve(ioc, appProcCfg, eac);
    }

    if (!resolver) {
      const defaultResolver = new DefaultProcessorHandlerResolver();

      resolver = await defaultResolver.Resolve(ioc, appProcCfg, eac);
    }

    return resolver;
  }
}
