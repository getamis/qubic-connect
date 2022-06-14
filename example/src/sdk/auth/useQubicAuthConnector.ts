import { useCallback, useEffect, useState } from 'react';
import fetch from 'cross-fetch';
import Base64 from 'crypto-js/enc-base64';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import { GraphQLClient, gql } from 'graphql-request';
import { QubicConnector } from '@qubic-js/react';
// import { useWeb3React } from '@web3-react/core';
// import { Web3Provider } from '@ethersproject/providers';

import {
  API_KEY,
  API_SECRET,
  CREATOR_API,
  QUBIC_API_KEY,
  QUBIC_API_SECRET,
  QUBIC_CHAIN_ID,
  QUBIC_INFURA_PROJECT_ID,
} from '../constants/environment';

interface BaseUserData {
  accessToken?: string | undefined;
  expiredAt?: number | undefined;
}

interface UserData extends BaseUserData {
  address?: string;
  email?: string;
  phone?: string;
  name?: string;
  isQubicUser?: boolean;
}

export interface QubicAuthConnector {
  qubicConnector: any | null;
  user: UserData | undefined | null;
  timeDiff: number;
  setUser: (user: UserData | null) => void;
  updateUser: (update: { address?: string; email?: string }) => void;
}

let qubicConnector: QubicConnector;

const GQL_NOW = gql`
  query NOW_PUBLIC {
    now
  }
`;

const HTTP_METHOD = 'POST';

interface RequestSignature {
  url: string;
  headers: Record<string, string>;
  body: unknown;
}

const requestSignature = ({ url, headers, body }: RequestSignature) => {
  const requestHeaders = { ...headers };
  const requestUrl = new URL(url);
  const now = String(Date.now());
  const requestURI = `${requestUrl.pathname}${requestUrl.search}`;
  let sig: string | undefined;

  try {
    const msg = `${now}${HTTP_METHOD}${requestURI}${body}`;
    sig = API_SECRET ? HmacSHA256(msg, API_SECRET).toString(Base64) : undefined;

    if (body) {
      requestHeaders['X-Es-Encrypted'] = 'yes';
    }

    if (sig) {
      requestHeaders['X-Es-Sign'] = sig;
    }
  } catch (error) {
    console.error('signature error');
  }

  requestHeaders['X-Es-Api-Key'] = API_KEY;
  requestHeaders['X-Es-Ts'] = now;
  return requestHeaders;
};

export const useQubicAuthConnector = () => {
  // const context = useWeb3React<Web3Provider>();
  // const { deactivate } = context;
  // const [user, setUser] = useState<UserData | undefined | null>(undefined);
  const [isAlignWithServerTime, setIsAlignWithServerTime] = useState<boolean>(false);

  const checkTimeDiff = useCallback(async () => {
    try {
      const client = new GraphQLClient(CREATOR_API, {
        fetch: (url: any, option: any) =>
          fetch(url, {
            ...option,
            headers: requestSignature({
              url,
              headers: option.headers,
              body: option.body,
            }),
          }),
      });

      await client.rawRequest(GQL_NOW);
      setIsAlignWithServerTime(true);
    } catch (error) {
      // ignored error.
      console.warn('Device local time not align with server time.');
    }
  }, []);

  useEffect(() => {
    checkTimeDiff();
  }, [checkTimeDiff]);

  useEffect(() => {
    try {
      qubicConnector = new QubicConnector({
        apiKey: QUBIC_API_KEY,
        apiSecret: QUBIC_API_SECRET,
        chainId: Number(QUBIC_CHAIN_ID),
        infuraProjectId: QUBIC_INFURA_PROJECT_ID,
        autoHideWelcome: true,
        enableIframe: true,
      });
    } catch (err) {
      console.log(err);
      // do nothing
    }
  }, []);

  // useEffect(() => {
  //   try {
  //     const authLocal = localStorage.getItem('creator-auth');
  //     const authRecover = JSON.parse(authLocal || '{}');
  //     const { expiredAt } = authRecover || {};

  //     if (expiredAt) {
  //       if (expiredAt * 1000 < Date.now()) {
  //         setUser(null);
  //         deactivate();
  //         localStorage.removeItem('creator-auth');
  //         return;
  //       }
  //     }

  //     setUser(authRecover || null);
  //   } catch (err) {
  //     // do nothing
  //     setUser(undefined);
  //   }
  // }, [deactivate]);

  return {
    qubicConnector,
    isAlignWithServerTime,
    // user, setUser
  };
};
