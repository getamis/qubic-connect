import { ExtendedExternalProvider, ExtendedExternalProviderMethod, ProviderOptions } from './ExtendedExternalProvider';
import { PaymentResult } from './Purchase';
import { QubicUser } from './QubicUser';

export interface QubicConnectConfig {
  /** name: for login purpose */
  name: string;
  /** service: for login purpose, default: qubic-creator */
  service?: string;
  /** apiUrl: creator admin api url, default: https://admin.qubic.market/market */
  apiUrl?: string;
  /** key: for apiUrl */
  key: string;
  /** secret: for apiUrl */
  secret: string;
  /** providerOptions: wallet provider option */
  providerOptions?: ProviderOptions;
  /** magicLoginWebsocketUrl: qubic wallet api graphql  */
  magicLoginWebsocketUrl?: string;
  /** magicLoginLinkUrl: link will be opened when button clicked */
  magicLoginLinkUrl?: string;

  // # fast login
  // authRedirectUrl where have different type of wallet
  authRedirectUrl?: string;
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

export type OnLogin = (error: Error | null, result?: WalletUser) => void;
export type OnLogout = (error: Error | null) => void;

export type OnPaymentDone = (error: Error | null, result?: PaymentResult) => void;
