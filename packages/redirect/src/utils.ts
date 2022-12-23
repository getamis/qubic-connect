import qs from 'query-string';
import { LoginRedirectWalletType, LoginRedirectSignInProvider } from './types';

export interface ResponseFail {
  errorMessage: string;
}

// in Qubic Connect

export interface RequestConnectToPass {
  walletType?: LoginRedirectWalletType;
  qubicSignInProvider?: LoginRedirectSignInProvider;
  redirectUrl: string;
  dataString: string;
}

export interface ResponsePassToConnectSuccess {
  accountAddress: string;
  signature: string;
  dataString: string;
  isQubicUser: boolean;
}

type ResponsePassToConnect = ResponseFail | ResponsePassToConnectSuccess;

export interface RequestPassToWallet {
  ticketRedirectUrl: string;
  provider: LoginRedirectSignInProvider;
}

export interface ResponseWalletToPassSuccess extends Partial<RequestConnectToPass> {
  ticket: string;
  expiredAt: string;
  address: string;
}

export type ResponseWalletToPassFail = ResponseFail & Partial<RequestConnectToPass>;

type ResponseWalletToPass = ResponseWalletToPassSuccess | ResponseFail;

export function createUrlRequestConnectToPass(url: string, options: RequestConnectToPass): string {
  const query: RequestConnectToPass = {
    walletType: options.walletType,
    qubicSignInProvider: options?.qubicSignInProvider,
    redirectUrl: encodeURIComponent(options.redirectUrl),
    dataString: encodeURIComponent(options.dataString),
  };
  return qs.stringifyUrl({
    url,
    query: query as any,
  });
}

export function getResponsePassToConnect(url: string): ResponsePassToConnect {
  const { query } = qs.parseUrl(url);
  if (query.errorMessage) {
    return {
      errorMessage: query.errorMessage,
    } as ResponseFail;
  }
  return {
    accountAddress: query.accountAddress,
    signature: query.signature,
    dataString: decodeURIComponent(query.dataString as string),
    isQubicUser: query.isQubicUser === 'true',
  } as ResponsePassToConnectSuccess;
}

export function cleanResponsePassToConnect(currentUrl: string): string {
  const {
    url,
    // remove previous result, key of LoginRequest and errorMessage but keep other query params
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    query: { accountAddress, signature, dataString, isQubicUser, errorMessage, ...restQuery },
  } = qs.parseUrl(currentUrl);

  const removedResultUrl = qs.stringifyUrl({
    url,
    query: restQuery,
  });
  return removedResultUrl;
}

// in Pass
export function getRequestConnectToPass(url: string): RequestConnectToPass | undefined {
  const { query } = qs.parseUrl(url);

  if (!query.redirectUrl || !query.dataString) {
    return undefined;
  }
  return {
    walletType: query.walletType as LoginRedirectWalletType,
    qubicSignInProvider: query.qubicSignInProvider as LoginRedirectSignInProvider,
    redirectUrl: decodeURIComponent(query.redirectUrl as string),
    dataString: decodeURIComponent(query.dataString as string),
  };
}

export function createUrlRequestPassToWallet(url: string, options: RequestPassToWallet): string {
  const query: RequestPassToWallet = {
    ticketRedirectUrl: encodeURIComponent(options.ticketRedirectUrl),
    provider: options.provider,
  };
  return qs.stringifyUrl({
    url,
    query: query as any,
  });
}

export function getResponseWalletToPass(url: string): ResponseWalletToPass {
  const { query } = qs.parseUrl(url);
  if (query.errorMessage) {
    return {
      errorMessage: query.errorMessage as string,
    };
  }

  const ticketRedirectUrlParams = getRequestConnectToPass(url);

  return {
    ticket: query.ticket as string,
    expiredAt: query.expiredAt as string,
    address: query.address as string,

    // ticketRedirectUrl has it own query parameter
    ...(ticketRedirectUrlParams?.dataString ? ticketRedirectUrlParams : {}),
  };
}

export function cleanResponseWalletToPass(currentUrl: string): string {
  const {
    url,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    query: { ticket, expiredAt, address, errorMessage, ...restQuery },
  } = qs.parseUrl(currentUrl);

  const removedResultUrl = qs.stringifyUrl({
    url,
    query: restQuery,
  });
  return removedResultUrl;
}

export function createUrlResponsePassToConnect(url: string, options: ResponsePassToConnect): string {
  if ('errorMessage' in options) {
    const query: ResponseFail = {
      errorMessage: options.errorMessage as string,
    };
    return qs.stringifyUrl({
      url,
      query: query as any,
    });
  }
  const query: ResponsePassToConnectSuccess = {
    accountAddress: options.accountAddress as string,
    signature: options.signature as string,
    dataString: options.dataString as string,
    isQubicUser: options.isQubicUser as boolean,
  };
  return qs.stringifyUrl({
    url,
    query: query as any,
  });
}

// wallet
export function getRequestPassToWallet(url: string): RequestPassToWallet | undefined {
  const { query } = qs.parseUrl(url);
  if (!query.ticketRedirectUrl) {
    return undefined;
  }
  return {
    ticketRedirectUrl: decodeURIComponent(query.ticketRedirectUrl as string),
    provider: query.provider as LoginRedirectSignInProvider,
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
    ticket: options.ticket as string,
    expiredAt: options.expiredAt as string,
    address: options.address as string,
  };
  return qs.stringifyUrl({
    url,
    query: query as any,
  });
}

export function createUrlResponseWalletToPassOrConnect(url: string, options: ResponseWalletToPass): string {
  const nextUrl = createUrlResponseWalletToPass(url, options);
  const params = getResponseWalletToPass(nextUrl);

  if (!('redirectUrl' in params)) {
    // not detecting url just go back to pass
    return nextUrl;
  }

  if (!params.redirectUrl) {
    return nextUrl;
  }

  // go back to connect directly
  if ('errorMessage' in params) {
    return createUrlResponsePassToConnect((params as any).redirectUrl, {
      errorMessage: (params as ResponseFail).errorMessage,
    });
  }

  if (!params.dataString) {
    throw Error('params data sting Not found');
  }

  return createUrlResponsePassToConnect(params.redirectUrl, {
    accountAddress: params.address,
    signature: params.ticket,
    dataString: params.dataString,
    isQubicUser: true,
  });
}
