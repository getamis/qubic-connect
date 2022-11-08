import { LoginResult } from '../api/auth';
import { ExtendedExternalProvider, ExtendedExternalProviderMethod, ProviderOptions } from './ExtendedExternalProvider';
import { PaymentResult } from './Purchase';

export interface QubicCreatorConfig {
  name: string;
  service: string;
  key: string;
  secret: string;
  providerOptions?: ProviderOptions;
  creatorUrl?: string;

  // # fast login
  // creatorAuthUrl where have different type of wallet
  creatorAuthUrl?: string;
  onCreatorAuthSuccess?: (result: LoginResult) => void;
  onCreatorAuthError?: (errorMessage: string) => void;
}

export interface ProviderLoginResult {
  method: ExtendedExternalProviderMethod;
  address: string;
  accessToken: string;
  provider: ExtendedExternalProvider | null;
}

export type OnLogin = (error: Error | null, result?: ProviderLoginResult) => void;
export type OnLogout = (error: Error | null) => void;

export type OnPaymentDone = (error: Error | null, result?: PaymentResult) => void;
