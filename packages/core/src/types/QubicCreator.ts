import { ExtendedExternalProvider, ExtendedExternalProviderMethod, ProviderOption } from './ExtendedExternalProvider';
import { PaymentResult } from './Purchase';

export type ProviderOptions = Partial<Record<ExtendedExternalProviderMethod, ProviderOption>>;

export interface QubicCreatorConfig {
  name: string;
  service: string;
  key: string;
  secret: string;
  providerOptions: ProviderOptions;
  creatorUrl?: string;
}

export interface LoginResult {
  method: ExtendedExternalProviderMethod;
  address: string;
  accessToken: string;
  provider: ExtendedExternalProvider;
}

export type OnLogin = (error: Error | null, result?: LoginResult) => void;
export type OnLogout = (error: Error | null) => void;

export type OnPaymentDone = (error: Error | null, result?: PaymentResult) => void;
