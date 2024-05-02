import crossFetch from 'cross-fetch';
import { getAccessToken } from '../api/auth';
import { SdkFetchError } from '../types';
import serviceHeaderBuilder from './serviceHeaderBuilder';

const ERROR_MESSAGE = 'Sdk fetch error';

async function parseResponseJson(response: Response): Promise<Record<string, any> | null> {
  try {
    const result = await response.json();
    return result.error || result;
  } catch (error) {
    return null;
  }
}

/**
 * will throw catch if response.ok is false
 */
async function handleFetchError(response: Response) {
  if (response.ok) return;
  const body = await parseResponseJson(response);
  throw new SdkFetchError({
    message: ERROR_MESSAGE,
    status: response.status,
    statusText: response.statusText,
    body,
  });
}

export interface SdkFetch {
  (path: string, init: RequestInit): Promise<Response>;
}

type CreateFetchProps = {
  apiKey: string;
  apiSecret: string;
  apiUrl: string;
  customHeaders?: Record<string, string>;
};

export const createFetch =
  ({ apiKey, apiSecret, apiUrl, customHeaders }: CreateFetchProps): SdkFetch =>
  async (path, init) => {
    const serviceUri = `${apiUrl}/${path}`;

    const serviceHeaders = serviceHeaderBuilder({
      serviceUri,
      httpMethod: init.method,
      body: init.body,
      apiKey,
      apiSecret,
      accessToken: getAccessToken(),
      customHeaders,
    });

    const { headers: initHeaders, ...restInit } = init;

    const response = await crossFetch(serviceUri, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...initHeaders,
        ...serviceHeaders,
      },
      credentials: 'include',
      ...restInit,
    });
    await handleFetchError(response);
    return response;
  };
