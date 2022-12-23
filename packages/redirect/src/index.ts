import {
  createUrlRequestConnectToPass,
  createUrlRequestPassToWallet,
  createUrlResponseWalletToPass,
  getRequestConnectToPass,
  getRequestPassToWallet,
  getResponseWalletToPass,
  createUrlResponsePassToConnect,
  getResponsePassToConnect,
  createUrlResponseWalletToPassOrConnect,
  cleanResponsePassToConnect,
  cleanResponseWalletToPass,
} from './utils';

export type { LoginRedirectWalletType, LoginRedirectSignInProvider } from './types';

export const RedirectAuthManager = {
  connect: {
    createUrlRequestConnectToPass,
    getResponsePassToConnect,
    cleanResponsePassToConnect,
  },
  pass: {
    getRequestConnectToPass,
    createUrlRequestPassToWallet,
    getResponseWalletToPass,
    cleanResponseWalletToPass,
    createUrlResponsePassToConnect,
  },
  wallet: {
    getRequestPassToWallet,
    createUrlResponseWalletToPass,
    createUrlResponseWalletToPassOrConnect,
  },
};
