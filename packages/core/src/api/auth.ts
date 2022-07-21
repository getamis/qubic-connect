import fetch from 'cross-fetch';
import querystring from 'query-string';
import serviceHeaderBuilder from '../utils/serviceHeaderBuilder';
import convertStringToHex from '../utils/convertStringToHex';
import { CREATOR_API_URL } from '../constants/backend';

interface Login {
  accountAddress: string | null;
  signature: string;
  dataString: string;
  isQubicUser: boolean;
  apiKey: string;
  apiSecret: string;
  creatorUrl?: string;
}

interface LoginResult {
  accessToken: string;
  expiredAt: number;
  isQubicUser: boolean;
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
}: Login): Promise<LoginResult> => {
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
