import { ExtendedExternalProvider, ExtendedExternalProviderMethod } from './ExtendedExternalProvider';
import { PaymentResult } from './Purchase';

export interface QubicCreatorConfig {
  name: string;
  service: string;
  domain: string;
  key: string;
  secret: string;
  qubicWalletUrl?: string;
  qubicWalletKey: string;
  qubicWalletSecret: string;
  infuraId: string;
  creatorUrl?: string;
  chainId?: number;
  tapPayMerchantId?: string;
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
