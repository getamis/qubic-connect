import { ExternalProvider } from '@ethersproject/providers';

export type ExtendedExternalProviderMethod = 'metamask' | 'qubic' | 'walletconnect' | 'custom';
export interface ExtendedExternalProvider extends ExternalProvider {
  isQubic?: boolean;
  isWalletConnect?: boolean;
}

export interface ProviderOption {
  display?: {
    logo?: string;
    name?: string;
  };
  provider: ExtendedExternalProvider;
}
