import { ExternalProvider } from '@ethersproject/providers';

export type ExtendedExternalProviderType = 'metamask' | 'qubic' | 'walletconnect';
export interface ExtendedExternalProvider extends ExternalProvider {
  isQubic?: boolean;
  isWalletconnect?: boolean;
}
