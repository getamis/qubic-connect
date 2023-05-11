import querystring from 'query-string';
import convertStringToHex from '../utils/convertStringToHex';
import { SdkFetch } from '../utils/sdkFetch';
import { Credential } from '../types/QubicConnect';

export interface LoginRequest {
  accountAddress: string;
  signature: string;
  dataString: string;
  isQubicUser: boolean;
  action?: 'login' | 'bind';
  bindTicket?: string;
}

export interface LoginResponse {
  accessToken: string;
  expiredAt: number;
  isQubicUser: boolean;
}

let globalAccessToken: string | null = null;

export const getAccessToken = (): string | null => {
  return globalAccessToken;
};

export const setAccessToken = (token: string | null): void => {
  globalAccessToken = token;
};

export const login = async (
  sdkFetch: SdkFetch,
  { accountAddress, signature, dataString, isQubicUser }: LoginRequest,
): Promise<LoginResponse> => {
  if (!accountAddress || !signature || (!isQubicUser && !dataString)) {
    throw new Error('Missing login data');
  }

  const payload = isQubicUser
    ? querystring.stringify({
        address: accountAddress,
        ticket: signature,
      })
    : querystring.stringify({
        provider: 'wallet',
        address: accountAddress,
        signature,
        data: convertStringToHex(dataString),
      });

  const serviceUri = isQubicUser ? `services/auth/qubic` : `services/auth`;

  const result = await sdkFetch(serviceUri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload,
  });

  const data = await result.json();

  globalAccessToken = data?.accessToken || null;
  return data as LoginResponse;
};

export const loginWithCredential = async (
  sdkFetch: SdkFetch,
  { identityTicket, expiredAt, address }: Credential,
): Promise<LoginResponse> => {
  if (!identityTicket || !expiredAt || !address) {
    throw new Error('Missing login data');
  }

  const httpMethod = 'POST';
  const payload = JSON.stringify({
    identityTicket,
    address,
  });

  const result = await sdkFetch('services/auth/prime', {
    method: httpMethod,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload,
  });

  const data = await result.json();

  globalAccessToken = data?.accessToken || null;
  return data as LoginResponse;
};

export const logout = async (sdkFetch: SdkFetch): Promise<void> => {
  const httpMethod = 'POST';
  await sdkFetch('services/auth/revoke', {
    method: httpMethod,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

export const renewToken = async (sdkFetch: SdkFetch): Promise<LoginResponse> => {
  const httpMethod = 'POST';
  const result = await sdkFetch('services/auth/renew', {
    method: httpMethod,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await result.json();

  globalAccessToken = data?.accessToken || null;
  return data as LoginResponse;
};
