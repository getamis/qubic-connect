import { ExtendedExternalProvider, ExtendedExternalProviderType } from './ExtendedExternalProvider';

export interface SdkConfig {
  name: string;
  service: string;
  domain: string;
  key: string;
  secret: string;
  qubicWalletKey: string;
  qubicWalletSecret: string;
  infuraId: string;
  creatorUrl?: string;
  chainId?: number;
}

export interface SdkLoginSuccessData {
  type: ExtendedExternalProviderType;
  address: string;
  accessToken: string;
  provider: ExtendedExternalProvider;
}

export type SdkOnLogin = (errorMessage: string | null, data?: SdkLoginSuccessData) => void;
export type SdkOnLogout = () => void;
