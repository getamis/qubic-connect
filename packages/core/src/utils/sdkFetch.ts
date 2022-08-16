import crossFetch from 'cross-fetch';
import { getAccessToken } from '../api/auth';
import serviceHeaderBuilder from './serviceHeaderBuilder';

export interface SdkFetch {
  (path: string, init: RequestInit): Promise<Response>;
}

export const createFetch =
  ({ apiKey, apiSecret, creatorUrl }: { apiKey: string; apiSecret: string; creatorUrl: string }): SdkFetch =>
  (path, init) => {
    const serviceUri = `${creatorUrl}/${path}`;

    const serviceHeaders = serviceHeaderBuilder({
      serviceUri,
      httpMethod: init.method,
      body: init.body,
      apiKey,
      apiSecret,
      accessToken: getAccessToken(),
    });

    const { headers: initHeaders, ...restInit } = init;

    return crossFetch(serviceUri, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...serviceHeaders,
        ...initHeaders,
      },
      ...restInit,
    });
  };
