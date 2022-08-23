import { ExtendedExternalProvider, ExtendedExternalProviderMethod, ProviderOptions } from './ExtendedExternalProvider';
import { PaymentResult } from './Purchase';

export interface QubicCreatorConfig {
  name: string;
  service: string;
  providerOptions: ProviderOptions;
  key: string;
  secret: string;
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
