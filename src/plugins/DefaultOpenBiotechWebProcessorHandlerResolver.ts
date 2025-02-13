import { DefaultAtomicIconsProcessorHandlerResolver } from '@fathym/atomic-icons/plugin';
import { DefaultMSALProcessorHandlerResolver } from '@fathym/msal';
import { IoCContainer } from '@fathym/ioc';
import {
  DefaultProcessorHandlerResolver,
  ProcessorHandlerResolver,
} from '@fathym/eac-applications/runtime/processors';
import { EaCApplicationProcessorConfig } from '@fathym/eac-applications/processors';
import { EverythingAsCode } from '@fathym/eac';

export class DefaultOpenBiotechWebProcessorHandlerResolver implements ProcessorHandlerResolver {
  public async Resolve(
    ioc: IoCContainer,
    appProcCfg: EaCApplicationProcessorConfig,
    eac: EverythingAsCode,
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
