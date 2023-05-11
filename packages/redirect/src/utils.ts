import qs from 'query-string';
import { LoginRedirectWalletType, QubicSignInProvider } from './types';

type KeysOfUnion<T> = T extends T ? keyof T : never;

type QueryRecord<T> = Record<KeysOfUnion<T>, string>;

export interface ResponseFail {
  errorMessage: string;
}

// in Qubic Connect

export interface RequestConnectToPass {
  walletType?: LoginRedirectWalletType;
  qubicSignInProvider?: QubicSignInProvider;
  redirectUrl: string;
  dataString: string;
  action?: 'login' | 'bind'; // default sign in
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
  expiredAt: number;
  action: 'bind';
}

export type ResponsePassToConnectSuccess = ResponsePassToConnectLoginSuccess | ResponsePassToConnectBindSuccess;

export type ResponsePassToConnect = ResponseFail | ResponsePassToConnectLoginSuccess | ResponsePassToConnectBindSuccess;

export interface RequestPassToWallet {
  ticketRedirectUrl: string;
  provider: QubicSignInProvider;
}

export interface ResponseWalletToPassSuccess extends Partial<RequestConnectToPass> {
  ticket: string;
  expiredAt: number;
  address: string;
}

export type ResponseWalletToPassFail = ResponseFail & Partial<RequestConnectToPass>;

export type ResponseWalletToPass = ResponseWalletToPassSuccess | ResponseFail;

export function createUrlRequestConnectToPass(url: string, options: RequestConnectToPass): string {
  const query: RequestConnectToPass = {
    walletType: options.walletType,
    qubicSignInProvider: options?.qubicSignInProvider,
    redirectUrl: encodeURIComponent(options.redirectUrl),
    dataString: encodeURIComponent(options.dataString),
    action: options.action,
  };
  return qs.stringifyUrl({
    url,
    query: query as any,
  });
}

export function getResponsePassToConnect(url: string): ResponsePassToConnect {
  const query = qs.parseUrl(url).query as QueryRecord<ResponsePassToConnect>;
  if (query.errorMessage) {
    return {
      errorMessage: query.errorMessage,
    } as ResponseFail;
  }

  if (query.action === 'bind') {
    return {
      action: 'bind',
      bindTicket: query.bindTicket,
      expiredAt: Number(query.expiredAt),
    };
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
      expiredAt,
      bindTicket,
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

  if (!query.redirectUrl || !query.dataString) {
    return undefined;
  }
  return {
    walletType: query.walletType as LoginRedirectWalletType,
    qubicSignInProvider: query.qubicSignInProvider as QubicSignInProvider,
    redirectUrl: decodeURIComponent(query.redirectUrl),
    dataString: decodeURIComponent(query.dataString),
    action: query.action as RequestConnectToPass['action'],
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
      redirectUrl: query.redirectUrl,
    };
  }

  const ticketRedirectUrlParams = getRequestConnectToPass(url);

  return {
    ticket: query.ticket,
    expiredAt: Number(query.expiredAt),
    address: query.address,

    // ticketRedirectUrl has it own query parameter
    ...(ticketRedirectUrlParams?.dataString ? ticketRedirectUrlParams : {}),
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

  if (!('redirectUrl' in params) || !params.redirectUrl || params.action === 'bind') {
    // not detecting url just go back to pass
    return nextUrl;
  }

  // if we detect redirectUrl we skip pass web, go to connect sdk directly
  if ('errorMessage' in params) {
    return createUrlResponsePassToConnect((params as any).redirectUrl, {
      errorMessage: (params as ResponseFail).errorMessage,
    });
  }

  if (!params.dataString) {
    throw Error('params data string Not found');
  }

  return createUrlResponsePassToConnect(params.redirectUrl, {
    accountAddress: params.address,
    signature: params.ticket,
    dataString: params.dataString,
    isQubicUser: true,
    action: 'login',
  });
}
