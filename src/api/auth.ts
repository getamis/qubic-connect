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
  // eslint-disable-next-line camelcase
  access_token: string;
  expiredAt: number;
  // eslint-disable-next-line camelcase
  expired_at: number;
  isQubicUser: boolean;
}

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
  return data as LoginResult;
};
