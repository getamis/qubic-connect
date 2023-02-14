import { ExternalProvider } from '@ethersproject/providers';

// redirect is a special case, which can get access token but no wallet provider
export type ExtendedExternalProviderMethod = 'metamask' | 'qubic' | 'walletconnect' | 'custom' | 'redirect';
export interface ExtendedExternalProvider extends ExternalProvider {
  isQubic?: boolean;
  isWalletConnect?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on?: (eventName: string, callback: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off?: (eventName: string, callback: any) => void;
  // signInProvider  would be defined @qubic-js/core
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setSignInProvider?: (signInProvider: any) => void;
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
