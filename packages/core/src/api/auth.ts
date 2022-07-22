import fetch from 'cross-fetch';
import querystring from 'query-string';
import serviceHeaderBuilder from '../utils/serviceHeaderBuilder';
import convertStringToHex from '../utils/convertStringToHex';
import { CREATOR_API_URL } from '../constants/backend';

interface LoginParams {
  accountAddress: string | null;
  signature: string;
  dataString: string;
  isQubicUser: boolean;
  apiKey: string;
  apiSecret: string;
  creatorUrl: string;
}

interface LoginResult {
  accessToken: string;
  expiredAt: number;
  isQubicUser: boolean;
}

interface LogoutParams {
  apiKey: string;
  apiSecret: string;
  creatorUrl: string;
}

let globalAccessToken: string | null = null;

export const getAccessToken = (): string | null => {
  return globalAccessToken;
};

export const login = async ({
  accountAddress,
  signature,
  dataString,
  isQubicUser,
  creatorUrl = CREATOR_API_URL,
  apiKey,
  apiSecret,
}: LoginParams): Promise<LoginResult> => {
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

  const serviceUri = isQubicUser ? `https://${creatorUrl}/services/auth/qubic` : `https://${creatorUrl}/services/auth`;

  const httpMethod = 'POST';
  const headers = serviceHeaderBuilder({
    serviceUri,
    httpMethod,
    body: payload,
    apiKey,
    apiSecret,
  });

  const result = await fetch(serviceUri, {
    method: httpMethod,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...headers,
    },
    body: payload,
  });
  const data = await result.json();

  globalAccessToken = data?.accessToken || null;
  return data as LoginResult;
};

export const logout = async ({
  creatorUrl = CREATOR_API_URL,
  apiKey,
  apiSecret,
}: LogoutParams): Promise<LoginResult> => {
  const serviceUri = `https://${creatorUrl}/services/auth/revoke`;

  const httpMethod = 'POST';
  const headers = serviceHeaderBuilder({
    serviceUri,
    httpMethod,
    apiKey,
    apiSecret,
  });

  if (globalAccessToken) {
    headers['Access-Control-Allow-Credentials'] = 'true';
    headers.Authorization = `Bearer ${globalAccessToken}`;
  }
  const result = await fetch(serviceUri, {
    method: httpMethod,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...headers,
    },
  });
  const data = await result.json();

  return data as LoginResult;
};
