import { useCallback, useEffect, useState } from 'react';
import fetch from 'cross-fetch';
import querystring from 'query-string';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider, ExternalProvider } from '@ethersproject/providers';
import { QubicConnector } from '@qubic-js/react';

// import { WalletPermissions } from '../types/wallet';
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

export type LoginMethod = 'wc' | 'qubic' | 'metamask';

interface CustomizeProvider extends ExternalProvider {
  isQubic?: boolean;
}

interface ApiKeyPair {
  key: string;
  secret: string;
}

interface CreatorAuthConnectorProps {
  authAppName: string;
  authAppUrl: string;
  authServiceName: string;
  keyPair: ApiKeyPair;
}

interface SignRPCPayload {
  jsonrpc: string;
  method: string;
  params: string[];
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

const signIn = async ({
  accountAddress,
  signature,
  dataString,
  isQubicUser,
}: SignInProps): Promise<SignInResult | undefined> => {
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

  const result = await fetch(serviceUri, {
    method: httpMethod,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      credentials: 'include',
      ...headers,
    },
    body: payload,
  });
  const data = await result.json();
  return { ...data, isQubicUser };
};

export const useAuth = (props: CreatorAuthConnectorProps) => {
  const context = useWeb3React<Web3Provider>();
  const { account, activate, deactivate, library: ethersProvider } = context;
  const [startSign, setStartSign] = useState<LoginMethod | undefined>();

  const [authData, setAuthData] = useState<SignInResult>();
  const [authSignature, setAuthSignature] = useState<string | undefined>('');
  const [signDataString, setSignDataString] = useState<string>('');
  const [isQubicUser, setIsQubicUser] = useState(true);

  const currentProvider = ethersProvider?.provider as CustomizeProvider;

  const handleSignAuthData = useCallback(
    async (payload: any) => {
      if (!account || !payload) {
        return;
      }
      const isQubic = Boolean((currentProvider as CustomizeProvider)?.isQubic);

      try {
        const signatureResult = currentProvider?.request ? await currentProvider.request(payload) : '';
        // When user reject or close qubic-wallet, will get Error as return value
        if (typeof signatureResult !== 'string' && !Array.isArray(signatureResult)) {
          throw signatureResult;
        }

        const signature = isQubic ? signatureResult[0] : signatureResult;
        setAuthSignature(signature);
      } catch (error) {
        console.log(error);
        console.log('簽章失敗');
        deactivate();
      }
    },
    [account, currentProvider, deactivate],
  );

  const handleCreatorSignIn = useCallback(
    async (input: SignInProps) => {
      try {
        const resultData = await signIn(input);
        setAuthData(resultData);
      } catch (err) {
        console.error('Creator sign-in ERROR', err);
        console.error('login_error');
      }
    },
    [setAuthData],
  );

  const handleQubicLogin = useCallback(
    async (ev?: any) => {
      if (!qubicConnector && typeof window === 'undefined') return;
      ev?.preventDefault();
      try {
        await activate(qubicConnector, (e: Error): void => {
          throw e;
        });
        setStartSign('qubic');
      } catch (err) {
        console.error(err);
        console.error('Login to Qubic fail.');
      }
    },
    [activate],
  );

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

  useEffect(() => {
    if (!account || !startSign || !currentProvider) return;
    const isQubicProvider = !!currentProvider?.isQubic;
    let rpcPayload: SignRPCPayload | undefined;
    const dataString = JSON.stringify({
      name: props.authAppName,
      url: props.authAppUrl,
      service: props.authServiceName,
      permissions: ['wallet.permission.access_email_address'],
      nonce: Date.now(),
    });

    if (startSign === 'qubic') {
      if (!isQubicProvider) return;
      setIsQubicUser(true);
      rpcPayload = {
        jsonrpc: '2.0',
        method: 'qubic_issueIdentityTicket',
        params: [],
      };
    } else {
      rpcPayload = {
        jsonrpc: '2.0',
        method: 'personal_sign',
        params: [account, convertStringToHex(dataString)],
      };
    }
    setSignDataString(dataString);
    handleSignAuthData(rpcPayload);
    setStartSign(undefined);
  }, [
    account,
    currentProvider,
    currentProvider?.isQubic,
    ethersProvider,
    handleSignAuthData,
    startSign,
    props.authAppName,
    props.authAppUrl,
    props.authServiceName,
  ]);

  useEffect(() => {
    if (authData) {
    }
  }, [authData]);

  useEffect(() => {
    // const accountAddress = account || walletConnectState.address;
    const accountAddress = account;
    if (accountAddress && authSignature && signDataString) {
      handleCreatorSignIn({
        accountAddress: account,
        signature: authSignature,
        dataString: signDataString,
        isQubicUser,
      });
    }
  }, [account, authSignature, handleCreatorSignIn, isQubicUser, signDataString]);

  return {
    // user,
    handleQubicLogin,
    authData,
    // handleQubicLoginMetaMask,
    // handleLogOut,
    // handleRenewAuth,
    // loginMsg,
    // keepCryptoActive,
    // timeDiff,
  };
};
