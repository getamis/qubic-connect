import { useCallback, useEffect, useState } from 'react';
import Web3 from 'web3';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { Web3Provider, ExternalProvider } from '@ethersproject/providers';
import { AbstractProvider } from 'web3-core';

import { useQubicAuthConnector } from './useQubicAuthConnector';
// import serviceHeaderBuilder from '../utils/serviceHeaderBuilder';
import convertStringToHex from '../utils/convertStringToHex';

const useAuth = () => {
  const context = useWeb3React<Web3Provider>();
  const { account, activate, deactivate, library: ethersProvider } = context;
  const { qubicConnector, isAlignWithServerTime } = useQubicAuthConnector();
  const [startSign, setStartSign] = useState(false);
  const [loginMsg, setLoginMsg] = useState('');

  const [authSignature, setAuthSignature] = useState<string | undefined>('');
  const [signDataString, setSignDataString] = useState<string>('');
  const [isQubicUser, setIsQubicUser] = useState(true);

  // const hasUserData = !!user?.expiredAt;
  const handleSignAuthData = useCallback(
    async (payload: any) => {
      if (!account || !payload) {
        return;
      }

      try {
        const currentProvider = window.web3?.currentProvider as AbstractProvider;
        const signature = currentProvider?.request ? await currentProvider.request(payload) : '';

        // When user reject or close qubic-wallet, will get Error as return value
        if (typeof signature !== 'string') {
          throw signature;
        }
        setAuthSignature(signature);
      } catch (error) {
        console.error(error);
        setLoginMsg('簽章失敗');
      }
    },
    [account],
  );

  const handleLogin = useCallback(
    async (ev?: any) => {
      ev?.preventDefault();
      setLoginMsg('');
      console.log(qubicConnector);
      if (qubicConnector && typeof window !== 'undefined') {
        console.log('sign');
        await activate(qubicConnector, (e: Error): void => {
          console.error(e);
          setLoginMsg('Login to Qubic fail.');
        });
        setStartSign(true);
      }
    },
    [activate, qubicConnector],
  );

  // useEffect(() => {
  //   if (account && startSign && ethersProvider) {
  //     const currentProvider = ethersProvider.provider as QubicProvider;
  //     const dataString = JSON.stringify({
  //       name: AUTH_APP_NAME,
  //       url: `https://${AUTH_APP_DOMAIN}/`,
  //       permissions: ['wallet.permission.access_email_address'],
  //       nonce: Date.now(),
  //       service: AUTH_SERVICE_NAME,
  //     });
  //     setSignDataString(dataString);
  //     const isQubic = !!currentProvider?.isQubic;
  //     setIsQubicUser(isQubic);
  //     const payload = {
  //       jsonrpc: '2.0',
  //       method: isQubic ? 'qubic_login' : 'personal_sign',
  //       params: [account, isQubic ? dataString : convertStringToHex(dataString)],
  //     };
  //     handleSignAuthData(payload);
  //     setStartSign(false);
  //   }
  // }, [account, ethersProvider]);

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
