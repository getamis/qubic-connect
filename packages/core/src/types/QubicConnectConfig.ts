import { ExtendedExternalProvider, ExtendedExternalProviderMethod, ProviderOptions } from './ExtendedExternalProvider';
import { QubicUser } from './QubicUser';

export interface QubicConnectConfig {
  name: string;
  service?: string;
  key: string;
  secret: string;
  providerOptions?: ProviderOptions;
  apiUrl?: string;
  marketApiUrl?: string;
  iabRedirectUrl?: string;
  shouldAlwaysShowCopyUI?: boolean;
  disableIabWarning?: boolean;
  disableOpenExternalBrowserWhenLineIab?: boolean;
  autoLoginInWalletIabType?: 'enable' | 'qubic-only' | 'disable';

  trackGaSettings?: Array<string>;

  // # fast login
  // authRedirectUrl where have different type of wallet
  authRedirectUrl?: string;

  customHeaders?: Record<string, string>;
}

export interface InternalQubicConnectConfig extends Omit<Required<QubicConnectConfig>, 'providerOptions'> {
  providerOptions?: ProviderOptions;
}

export interface WalletUser {
  method: ExtendedExternalProviderMethod;
  address: string;
  accessToken: string;
  expiredAt: number;
  provider: ExtendedExternalProvider | null;
  qubicUser: QubicUser | null;
}

export interface BindTicketResult {
  bindTicket: string;
  expireTime: string;
}

export interface Credential {
  identityTicket: string;
  expiredAt: number;
  address: string;
}

export type OnLogin = (error: Error | null, result?: WalletUser) => void;
export type OnLogout = (error: Error | null) => void;
