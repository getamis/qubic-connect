import querystring from 'query-string';
import convertStringToHex from '../utils/convertStringToHex';
import { SdkFetch } from '../utils/sdkFetch';

export interface LoginRequest {
  accountAddress: string;
  signature: string;
  dataString: string;
  isQubicUser: boolean;
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
