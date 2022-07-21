import { ExternalProvider } from '@ethersproject/providers';

export type ExtendedExternalProviderMethod = 'metamask' | 'qubic' | 'walletconnect';
export interface ExtendedExternalProvider extends ExternalProvider {
  isQubic?: boolean;
  isWalletconnect?: boolean;
}
