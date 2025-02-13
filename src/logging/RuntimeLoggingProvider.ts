import { EaCApplicationsLoggingProvider } from '@fathym/eac-applications/runtime/logging';

export class RuntimeLoggingProvider extends EaCApplicationsLoggingProvider {
  constructor() {
    const loggingPackages = ['@o-biotech/common', '@o-biotech/open-biotech-web-runtime'];

    super(loggingPackages);
  }
}
