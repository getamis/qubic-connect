import { useCallback, useEffect, useState } from 'react';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { Web3Provider, ExternalProvider } from '@ethersproject/providers';

import { useQubicAuthConnector } from './useQubicAuthConnector';
// import serviceHeaderBuilder from '../utils/serviceHeaderBuilder';
// import convertStringToHex from '../utils/convertStringToHex';

const useAuth = () => {
  const context = useWeb3React<Web3Provider>();
  const { account, activate, deactivate, library: ethersProvider } = context;

  const { qubicConnector, user, setUser, timeDiff } = useQubicAuthConnector({ clientName: '' });
  const [startSign, setStartSign] = useState(false);
  const [loginMsg, setLoginMsg] = useState('');

  // const [authSignature, setAuthSignature] = useState<string | undefined>('');
  // const [signDataString, setSignDataString] = useState<string>('');
  // const [isQubicUser, setIsQubicUser] = useState(true);

  const hasUserData = !!user?.expiredAt;

  const handleLogin = useCallback(
    async (ev?: any) => {
      ev?.preventDefault();

      setLoginMsg('');
      if (qubicConnector && typeof window !== 'undefined') {
        await activate(qubicConnector, (e: Error): void => {
          console.error(e);
          setLoginMsg('Login to Qubic fail.');
        });
        setStartSign(true);
      }
    },
    [activate, qubicConnector],
  );

  useEffect(() => {
    if (!hasUserData && account && startSign && ethersProvider) {
      // const currentProvider = ethersProvider.provider as QubicProvider;
      // const dataString = JSON.stringify({
      //   name: AUTH_APP_NAME,
      //   url: `https://${AUTH_APP_DOMAIN}/`,
      //   permissions: ['wallet.permission.access_email_address'],
      //   nonce: Date.now(),
      //   service: AUTH_SERVICE_NAME,
      // });
      // setSignDataString(dataString);
      // const isQubic = !!currentProvider?.isQubic;
      // setIsQubicUser(isQubic);
      // const payload = {
      //   jsonrpc: '2.0',
      //   method: isQubic ? 'qubic_login' : 'personal_sign',
      //   params: [account, isQubic ? dataString : convertStringToHex(dataString)],
      // };
      // handleSignAuthData(payload);
      // setStartSign(false);
    }
  }, [account, ethersProvider, hasUserData, startSign]);

  return {
    user,
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
