import { useCallback, useEffect, useState } from 'react';
import fetch from 'cross-fetch';
import querystring from 'query-string';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { Web3Provider, ExternalProvider } from '@ethersproject/providers';
import { QubicConnector } from '@qubic-js/react';

// import useWalletConnect from './useWalletConnect';
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

const SUPPORTED_CHAIN_IDS = [1, 3, 4, 5, 137, 80001];

// export type LoginMethod = 'metamask' | 'wallet_connect' | 'qubic';
export type LoginMethod = 'metamask' | 'qubic';

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

interface SignPayload {
  jsonrpc: string;
  method: string;
  params: string[];
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
  const [isQubicUser, setIsQubicUser] = useState(false);

  // const { walletConnector, connectWC, isWalletConnected, walletConnectState, disconnectWC } = useWalletConnect({
  //   onConnectCallback: () => setStartSign('wallet_connect'),
  // });

  const currentProvider = ethersProvider?.provider as CustomizeProvider;

  // const keepCryptoActive = useCallback(async () => {
  //   setLoginMsg('');

  //   if (walletConnector && isWalletConnected) {
  //     await connectWC();
  //     return;
  //   }

  //   const connector = user?.isQubicUser
  //     ? qubicConnector
  //     : new InjectedConnector({
  //         supportedChainIds: SUPPORTED_CHAIN_IDS,
  //       });

  //   if (!ethersProvider && connector && typeof window !== 'undefined') {
  //     await activate(connector, (e: Error): void => {
  //       console.error('Keep crypto active ERROR', e);
  //       if (e instanceof UnsupportedChainIdError) {
  //         alert(e.message);
  //       }
  //       setLoginMsg(t('login_qubic_error'));
  //     });
  //   }
  // }, [activate, connectWC, ethersProvider, isWalletConnected, qubicConnector, t, user?.isQubicUser, walletConnector]);

  const signByWeb3Provider = useCallback(
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

  const handleQubicLogin = useCallback(async () => {
    if (!qubicConnector && typeof window === 'undefined') return;
    try {
      await activate(qubicConnector, (e: Error): void => {
        throw e;
      });
      setStartSign('qubic');
    } catch (err) {
      console.error(err);
      console.error('Login to Qubic fail.');
    }
  }, [activate]);

  const handleLoginMetaMask = useCallback(async () => {
    if (!window.ethereum || (window.ethereum && !window.ethereum.isMetaMask)) {
      // alert(t('install_metamask_alert'));
      // setLoginMsg(t('login_metamask_error'));
      return;
    }

    // setLoginMsg('');
    // await disconnectWC();

    const dappConnector = new InjectedConnector({
      supportedChainIds: SUPPORTED_CHAIN_IDS,
    });

    if (dappConnector && typeof window !== 'undefined') {
      await activate(dappConnector, (e: Error): void => {
        console.error('Metamask login ERROR', e);
        if (e instanceof UnsupportedChainIdError) {
          alert(e.message);
        }
        // setLoginMsg(t('login_metamask_error'));
      });
      setStartSign('metamask');
    }
  }, [activate]);

  // const signByWalletConnector = useCallback(
  //   async (payload: SignPayload) => {
  //     if (!walletConnector) {
  //       return;
  //     }

  //     if (!payload) {
  //       console.error('Missing WalletConnector sign payload');
  //       // setLoginMsg(t('sign_error'));
  //       return;
  //     }

  //     try {
  //       const signature = await walletConnector.signPersonalMessage(payload.params);
  //       // When user reject or close qubic-wallet, will get Error as return value
  //       if (typeof signature !== 'string') {
  //         throw signature;
  //       }
  //       setAuthSignature(signature);
  //     } catch (error) {
  //       console.error('WalletConnect Sign Auth ERROR', error);
  //       // setLoginMsg(t('sign_error'));
  //     }
  //   },
  //   [walletConnector],
  // );

  // const handleRenewAuth = useCallback(async () => {
  //   if (isRenewAuthProcessing) {
  //     return;
  //   }
  //   isRenewAuthProcessing = true;
  //   try {
  //     const newData = await renewAuth(apiKeyPair);
  //     const newUser = { ...user, ...newData };
  //     setupAuthData(newUser);
  //   } catch (err) {
  //     console.error('Renew auth ERROR', err);
  //     handleLogOut({});
  //   }
  //   isRenewAuthProcessing = false;
  // }, [apiKeyPair, user, setupAuthData, handleLogOut]);

  // /**
  //  * Check user?.expiredAt to renewAuth or logout
  //  */
  // if (user?.expiredAt) {
  //   const expiredAtMs = user.expiredAt * 1000;
  //   if (expiredAtMs <= Date.now()) {
  //     handleLogOut({});
  //   } else if (expiredAtMs <= Date.now() + RENEW_AUTH_THRESHOLD_MS) {
  //     handleRenewAuth();
  //   }
  // }

  // const execSwitchAccounts = useCallback(async () => {
  //   if (!ethersProvider) {
  //     return;
  //   }

  //   if (!user?.isQubicUser) {
  //     setLoginMsg(t('not_qubic_user_error'));
  //     return;
  //   }

  //   if (!account) {
  //     setLoginMsg(t('switch_account_error'));
  //     return;
  //   }

  //   try {
  //     const currentProvider = ethersProvider.provider;

  //     if (currentProvider?.request) {
  //       await currentProvider.request({
  //         method: 'eth_requestAccounts',
  //       });

  //       setWalletUserSwitched(true);
  //     }
  //   } catch (error) {
  //     console.error('Switch account ERROR', error);
  //     setLoginMsg(t('switch_account_error'));
  //   }
  // }, [account, ethersProvider, t, user?.isQubicUser]);

  // const handleLoginWalletConnect = useCallback(async () => {
  //   // setLoginMsg('');
  //   await connectWC();
  // }, [connectWC]);

  // const handleLogOut = useCallback(
  //   async (ev?) => {
  //     if (ev?.preventDefault) {
  //       ev?.preventDefault();
  //     }

  //     if (!isLogin || isLogoutProcessing) {
  //       return;
  //     }

  //     isLogoutProcessing = true;

  //     try {
  //       if (walletConnector) {
  //         await disconnectWC();
  //       } else {
  //         deactivate();
  //       }

  //       await signOut(apiKeyPair);
  //     } catch (error) {
  //       // do nothing
  //     }

  //     setUser(null);
  //     setSignDataString('');
  //     setAuthSignature('');
  //     setStartSwitchQubicUser(false);
  //     setStartSign(false);
  //     removeAuthDataFromStorage();

  //     apolloClient.resetStore();

  //     isLogoutProcessing = false;

  //     // silence logout
  //     if (ev) {
  //       alert('Logout!');
  //     }
  //   },
  //   [apiKeyPair, isLogin, apolloClient, deactivate, disconnectWC, setUser, walletConnector],
  // );

  const handleSignAuthData = useCallback(
    async (payload: SignPayload) => {
      // if (walletConnector) {
      //   signByWalletConnector(payload);
      // } else
      if (ethersProvider) {
        signByWeb3Provider(payload);
      } else {
        // setLoginMsg(t('sign_error'));
      }
    },
    [ethersProvider, signByWeb3Provider],
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
    if (!startSign) return;

    const isQubicProvider = !!currentProvider?.isQubic;
    // const wcAddress = walletConnectState.address;
    // const isUseWalletConnect = wcAddress && walletConnector;
    // console.log(wcAddress);
    // console.log(isUseWalletConnect);
    let rpcPayload: SignRPCPayload | undefined;

    const dataString = JSON.stringify({
      name: props.authAppName,
      url: props.authAppUrl,
      service: props.authServiceName,
      permissions: ['wallet.permission.access_email_address'],
      nonce: Date.now(),
    });

    setSignDataString(dataString);

    if (account && currentProvider) {
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
          params: [convertStringToHex(dataString), account],
        };
      }
    }
    // else if (isUseWalletConnect) {
    //   rpcPayload = {
    //     jsonrpc: '2.0',
    //     method: 'personal_sign',
    //     params: [convertStringToHex(dataString), wcAddress],
    //   };
    // }

    if (rpcPayload) {
      handleSignAuthData(rpcPayload);
    } else {
      // if (walletConnector) {
      //   disconnectWC();
      // }

      console.error('Sign fail: no payload');
    }

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
    // walletConnectState.address,
    // walletConnector,
    // disconnectWC,
  ]);

  useEffect(() => {
    // const accountAddress = account || walletConnectState.address;
    const accountAddress = account;
    if (accountAddress && authSignature && signDataString) {
      handleCreatorSignIn({
        accountAddress,
        signature: authSignature,
        dataString: signDataString,
        isQubicUser,
      });
    }
  }, [account, authSignature, handleCreatorSignIn, isQubicUser, signDataString]);

  return {
    // user,
    // handleLoginWalletConnect,
    handleLoginMetaMask,
    handleQubicLogin,
    accessToken: authData?.accessToken,
    address: account,
    // handleLogOut,
    // handleRenewAuth,
    // loginMsg,
    // keepCryptoActive,
    // timeDiff,
  };
};
