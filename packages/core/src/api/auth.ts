import querystring from 'query-string';
import convertStringToHex from '../utils/convertStringToHex';
import { SdkFetch } from '../utils/sdkFetch';

export interface LoginParams {
  accountAddress: string;
  signature: string;
  dataString: string;
  isQubicUser: boolean;
}

export interface LoginResult {
  accessToken: string;
  expiredAt: number;
  isQubicUser: boolean;
}

let globalAccessToken: string | null = null;

export const getAccessToken = (): string | null => {
  return globalAccessToken;
};

export const login = async (
  sdkFetch: SdkFetch,
  { accountAddress, signature, dataString, isQubicUser }: LoginParams,
): Promise<LoginResult> => {
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

  const httpMethod = 'POST';

  const result = await sdkFetch(serviceUri, {
    method: httpMethod,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload,
  });

  if (result.status === 401) {
    throw Error('401 Unauthorized');
  }

  const data = await result.json();

  globalAccessToken = data?.accessToken || null;
  return data as LoginResult;
};

export const logout = async (sdkFetch: SdkFetch): Promise<LoginResult> => {
  const httpMethod = 'POST';
  const result = await sdkFetch('services/auth/revoke', {
    method: httpMethod,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const data = await result.json();

  return data as LoginResult;
};
