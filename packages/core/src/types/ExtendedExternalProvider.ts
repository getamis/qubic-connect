import { ExternalProvider } from '@ethersproject/providers';

// redirect is a special case, which can get access token but no wallet porivder
export type ExtendedExternalProviderMethod = 'metamask' | 'qubic' | 'walletconnect' | 'custom' | 'redirect';
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

export type ProviderOptions = Partial<
  Record<Exclude<ExtendedExternalProviderMethod, 'metamask'>, ProviderOption> &
    Record<'metamask', Partial<ProviderOption>>
>;
