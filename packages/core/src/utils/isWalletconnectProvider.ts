import WalletConnectProvider from '@walletconnect/web3-provider';
import { ExtendedExternalProvider, ExtendedExternalProviderMethod } from '../types/ExtendedExternalProvider';

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
