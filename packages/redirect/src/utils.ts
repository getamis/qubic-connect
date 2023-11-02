import qs from 'query-string';
import { LoginRedirectWalletType, QubicSignInProvider } from './types';

type KeysOfUnion<T> = T extends T ? keyof T : never;

type QueryRecord<T> = Record<KeysOfUnion<T>, string>;

export interface ResponseFail {
  errorMessage: string;
}

// in Qubic Connect

export interface RequestConnectToPassLogin {
  walletType?: LoginRedirectWalletType;
  qubicSignInProvider?: QubicSignInProvider;
  redirectUrl: string;
  apiKey: string;
  dataString: string;
  action: 'login';
}

export interface RequestConnectToPassBind {
  walletType?: LoginRedirectWalletType;
  qubicSignInProvider?: QubicSignInProvider;
  redirectUrl: string;
  apiKey: string;
  dataString: string;
  clientTicket: string;
  action: 'bind';
}

export type RequestConnectToPass = RequestConnectToPassBind | RequestConnectToPassLogin;

export interface ResponsePassToConnectFail extends ResponseFail {
  action: 'bind' | 'login';
}

export interface ResponsePassToConnectLoginSuccess {
  accountAddress: string;
  signature: string;
  dataString: string;
  isQubicUser: boolean;
  action?: 'login';
}

export interface ResponsePassToConnectBindSuccess {
  bindTicket: string;
  expireTime: string;
  action: 'bind';
}

export type ResponsePassToConnectSuccess = ResponsePassToConnectLoginSuccess | ResponsePassToConnectBindSuccess;

export type ResponsePassToConnect =
  | ResponsePassToConnectFail
  | ResponsePassToConnectLoginSuccess
  | ResponsePassToConnectBindSuccess;

export interface RequestPassToWallet {
  ticketRedirectUrl: string;
  provider: QubicSignInProvider;
}

export interface ResponseWalletToPassSuccess {
  ticket: string;
  expiredAt: number;
  address: string;
}

export type ResponseWalletToPassFail = ResponseFail & Partial<RequestConnectToPass>;

export type ResponseWalletToPass = ResponseWalletToPassSuccess | ResponseFail;

export function createUrlRequestConnectToPass(url: string, options: RequestConnectToPass): string {
  const query: RequestConnectToPass =
    options.action === 'login'
      ? {
          walletType: options.walletType,
          qubicSignInProvider: options?.qubicSignInProvider,
          redirectUrl: encodeURIComponent(options.redirectUrl),
          apiKey: options.apiKey,
          dataString: encodeURIComponent(options.dataString),
          action: options.action,
        }
      : {
          walletType: options.walletType,
          qubicSignInProvider: options?.qubicSignInProvider,
          redirectUrl: encodeURIComponent(options.redirectUrl),
          apiKey: options.apiKey,
          dataString: encodeURIComponent(options.dataString),
          clientTicket: options.clientTicket,
          action: 'bind',
        };
  return qs.stringifyUrl({
    url,
    query: query as any,
  });
}

export function getResponsePassToConnect(url: string): ResponsePassToConnect | null {
  const query = qs.parseUrl(url).query as QueryRecord<ResponsePassToConnect>;
  if (query.errorMessage) {
    return {
      action: query.action,
      errorMessage: query.errorMessage,
    } as ResponsePassToConnectFail;
  }

  if (query.action === 'bind') {
    return {
      action: 'bind',
      bindTicket: query.bindTicket,
      expireTime: query.expireTime,
    };
  }

  if (!query.accountAddress || !query.signature || !query.dataString) {
    return null;
  }

  return {
    action: 'login',
    accountAddress: query.accountAddress,
    signature: query.signature,
    dataString: decodeURIComponent(query.dataString as string),
    isQubicUser: query.isQubicUser === 'true',
  };
}

export function cleanResponsePassToConnect(currentUrl: string): string {
  const {
    url,
    // remove previous result, key of LoginRequest and errorMessage but keep other query params
    /* eslint-disable @typescript-eslint/no-unused-vars */
    query: {
      accountAddress,
      signature,
      dataString,
      isQubicUser,
      errorMessage,
      action,
      bindTicket,
      expireTime,
      ...restQuery
    },
    fragmentIdentifier,
  } = qs.parseUrl(currentUrl, { parseFragmentIdentifier: true });
  /* eslint-enable */

  const removedResultUrl = qs.stringifyUrl({
    url,
    query: restQuery,
    fragmentIdentifier,
  });
  return removedResultUrl;
}

// in Pass
export function getRequestConnectToPass(url: string): RequestConnectToPass | undefined {
  const query = qs.parseUrl(url).query as QueryRecord<RequestConnectToPass>;

  if (!query.redirectUrl) {
    return undefined;
  }
  return query.action === 'login'
    ? {
        walletType: query.walletType as LoginRedirectWalletType,
        qubicSignInProvider: query.qubicSignInProvider as QubicSignInProvider,
        redirectUrl: decodeURIComponent(query.redirectUrl),
        apiKey: query.apiKey,
        dataString: decodeURIComponent(query.dataString),
        action: 'login',
      }
    : {
        walletType: query.walletType as LoginRedirectWalletType,
        qubicSignInProvider: query.qubicSignInProvider as QubicSignInProvider,
        redirectUrl: decodeURIComponent(query.redirectUrl),
        apiKey: query.apiKey,
        dataString: decodeURIComponent(query.dataString),
        clientTicket: query.clientTicket,
        action: 'bind',
      };
}

export function createUrlRequestPassToWallet(url: string, options: RequestPassToWallet): string {
  const query: QueryRecord<RequestPassToWallet> = {
    ticketRedirectUrl: encodeURIComponent(options.ticketRedirectUrl),
    provider: options.provider,
  };

  return qs.stringifyUrl({
    url,
    query,
  });
}

export function getResponseWalletToPass(url: string): ResponseWalletToPass {
  const query = qs.parseUrl(url).query as QueryRecord<ResponseWalletToPass>;
  if (query.errorMessage) {
    return {
      errorMessage: query.errorMessage,
    };
  }

  return {
    ticket: query.ticket,
    expiredAt: Number(query.expiredAt),
    address: query.address,
  };
}

export function cleanResponseWalletToPass(currentUrl: string): string {
  const {
    url,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    query: { ticket, expiredAt, address, errorMessage, ...restQuery },
    fragmentIdentifier,
  } = qs.parseUrl(currentUrl, { parseFragmentIdentifier: true });

  const removedResultUrl = qs.stringifyUrl({
    url,
    query: restQuery,
    fragmentIdentifier,
  });
  return removedResultUrl;
}

export function createUrlResponsePassToConnect(url: string, options: ResponsePassToConnect): string {
  return qs.stringifyUrl({
    url,
    query: options as any,
  });
}

// wallet
export function getRequestPassToWallet(url: string): RequestPassToWallet | undefined {
  const query = qs.parseUrl(url).query as QueryRecord<RequestPassToWallet>;
  if (!query.ticketRedirectUrl) {
    return undefined;
  }
  return {
    ticketRedirectUrl: decodeURIComponent(query.ticketRedirectUrl as string),
    provider: query.provider as QubicSignInProvider,
  };
}

export function createUrlResponseWalletToPass(url: string, options: ResponseWalletToPass): string {
  if ('errorMessage' in options) {
    return qs.stringifyUrl({
      url,
      query: { errorMessage: options.errorMessage },
    });
  }
  const query: ResponseWalletToPassSuccess = {
    ticket: options.ticket,
    expiredAt: options.expiredAt,
    address: options.address,
  };
  return qs.stringifyUrl({
    url,
    query: query as any,
  });
}

export function createUrlResponseWalletToPassOrConnect(url: string, options: ResponseWalletToPass): string {
  const nextUrl = createUrlResponseWalletToPass(url, options);
  const params = getResponseWalletToPass(nextUrl);

  const requestConnectToPassParams = getRequestConnectToPass(nextUrl);

  if (
    !requestConnectToPassParams ||
    !requestConnectToPassParams.redirectUrl ||
    requestConnectToPassParams.action === 'bind'
  ) {
    // not detecting url just go back to pass
    return nextUrl;
  }

  // if we detect redirectUrl we skip pass web, go to connect sdk directly
  if ('errorMessage' in params) {
    return createUrlResponsePassToConnect((params as any).redirectUrl, {
      action: requestConnectToPassParams.action,
      errorMessage: (params as ResponseFail).errorMessage,
    });
  }

  if (!requestConnectToPassParams.dataString) {
    throw Error('params data string Not found');
  }

  return createUrlResponsePassToConnect(requestConnectToPassParams.redirectUrl, {
    accountAddress: params.address,
    signature: params.ticket,
    dataString: requestConnectToPassParams.dataString,
    isQubicUser: true,
    action: 'login',
  });
}
