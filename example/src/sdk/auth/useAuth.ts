import { useCallback, useEffect, useState } from 'react';
import fetch from 'cross-fetch';
import Web3 from 'web3';
import querystring from 'query-string';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { Web3Provider, ExternalProvider } from '@ethersproject/providers';
import { QubicConnector } from '@qubic-js/react';

import serviceHeaderBuilder from '../utils/serviceHeaderBuilder';
import convertStringToHex from '../utils/convertStringToHex';

import {
  API_KEY,
  API_SECRET,
  CREATOR_API_URL,
  QUBIC_API_KEY,
  QUBIC_API_SECRET,
  QUBIC_CHAIN_ID,
  QUBIC_INFURA_PROJECT_ID,
} from '../constants/environment';

interface CustomizeProvider extends ExternalProvider {
  isQubic?: boolean;
}

interface SignInProps {
  accountAddress: string | null;
  signature: string;
  dataString: string;
  isQubicUser: boolean;
}

interface SignInResult {
  accessToken: string;
  access_token: string;
  expiredAt: number;
  expired_at: number;
  isQubicUser: boolean;
}

let qubicConnector: QubicConnector;

const signIn = async ({ accountAddress, signature, dataString, isQubicUser }: SignInProps) => {
  if (!API_KEY || !API_SECRET) {
    throw new Error('No API Auth or client info');
  }
  if (!accountAddress || !signature || (!isQubicUser && !dataString)) {
    console.error('Missing sign-in data');
    return;
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
  const serviceUri = isQubicUser
    ? `https://${CREATOR_API_URL}/services/auth/qubic`
    : `https://${CREATOR_API_URL}/services/auth`;
  const httpMethod = 'POST';
  const headers: any = serviceHeaderBuilder({
    serviceUri,
    httpMethod,
    body: payload,
    apiKey: API_KEY,
    apiSecret: API_SECRET,
  });
  console.log(headers);
  try {
    const result = await fetch(serviceUri, {
      method: httpMethod,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...headers,
      },
      body: payload,
    });
    const data = await result.json();
    console.log(data);
  } catch (err) {
    console.log(err);
  }
  // const { data } = await axios.post(serviceUri, payload, {
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //     ...headers,
  //   },
  //   withCredentials: true,
  // });
  // return { ...data, isQubicUser };
};

const useAuth = () => {
  const context = useWeb3React<Web3Provider>();
  const { account, activate, deactivate, library: ethersProvider } = context;
  const [startSign, setStartSign] = useState(false);

  const [authSignature, setAuthSignature] = useState<string | undefined>('');
  const [signDataString, setSignDataString] = useState<string>('');
  const [isQubicUser, setIsQubicUser] = useState(true);

  const currentProvider = ethersProvider?.provider as CustomizeProvider;

  useEffect(() => {
    qubicConnector = new QubicConnector({
      apiKey: QUBIC_API_KEY,
      apiSecret: QUBIC_API_SECRET,
      chainId: Number(QUBIC_CHAIN_ID),
      infuraProjectId: QUBIC_INFURA_PROJECT_ID,
      autoHideWelcome: true,
      enableIframe: true,
    });
  }, []);

  const handleSignAuthData = useCallback(
    async (payload: any) => {
      if (!account || !payload) {
        return;
      }

      try {
        const signature = currentProvider?.request ? await currentProvider.request(payload) : '';
        // When user reject or close qubic-wallet, will get Error as return value
        if (typeof signature !== 'string') {
          throw signature;
        }
        setAuthSignature(signature);
        console.log(signature);
        signIn({
          accountAddress: account,
          signature,
          dataString: signDataString,
          isQubicUser,
        });
      } catch (error) {
        console.error(error);
        console.error('簽章失敗');
        deactivate();
      }
    },
    [account, currentProvider, deactivate, isQubicUser, signDataString],
  );

  const handleLogin = useCallback(
    async (ev?: any) => {
      if (typeof window === 'undefined') return;
      ev?.preventDefault();
      try {
        await activate(qubicConnector, (e: Error): void => {
          throw e;
        });
        setStartSign(true);
      } catch (err) {
        console.error(err);
        console.error('Login to Qubic fail.');
      }
    },
    [activate],
  );

  useEffect(() => {
    const isQubic = !!currentProvider?.isQubic;

    if (account && startSign && currentProvider && isQubic) {
      const dataString = JSON.stringify({
        name: 'Qubic Creator',
        url: 'https://creator.dev.qubic.market',
        permissions: ['wallet.permission.access_email_address'],
        nonce: Date.now(),
        service: 'qubee-creator',
      });
      setSignDataString(dataString);
      setIsQubicUser(isQubic);
      const payload = {
        jsonrpc: '2.0',
        method: isQubic ? 'qubic_login' : 'personal_sign',
        params: [account, isQubic ? dataString : convertStringToHex(dataString)],
      };
      handleSignAuthData(payload);
      setStartSign(false);
    }
  }, [account, currentProvider, currentProvider?.isQubic, ethersProvider, handleSignAuthData, startSign]);

  useEffect(() => {
    // const accountAddress = account || walletConnectState.address;
    const accountAddress = account;
    if (accountAddress && authSignature && signDataString) {
      // handleCreatorSignIn({
      //   accountAddress,
      //   signature: authSignature,
      //   dataString: signDataString,
      //   isQubicUser: isQubicProvider,
      // });
    }
  }, [account, authSignature, signDataString]);

  return {
    // user,
    handleLogin,
    // handleLoginMetaMask,
    // handleLogOut,
    // handleRenewAuth,
    // loginMsg,
    // keepCryptoActive,
    // timeDiff,
  };
};

export default useAuth;
