import WalletConnectProvider from '@walletconnect/web3-provider';
import { ExtendedExternalProvider, ExtendedExternalProviderType } from '../types/ExtendedExternalProvider';

export function isWalletconnectProvider(
  providerType: ExtendedExternalProviderType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  provider: ExtendedExternalProvider,
): provider is WalletConnectProvider {
  if (providerType === 'walletconnect') {
    return true;
  }
  return false;
}
