import { ExtendedExternalProvider, ExtendedExternalProviderMethod } from '../types/ExtendedExternalProvider';

interface WalletConnectProvider extends ExtendedExternalProvider {
  accounts: string[];
  enable: () => Promise<string[]>;
}

export function isWalletconnectProvider(
  providerType: ExtendedExternalProviderMethod,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  provider: ExtendedExternalProvider,
): provider is WalletConnectProvider {
  if (providerType === 'walletconnect') {
    return true;
  }
  return false;
}
