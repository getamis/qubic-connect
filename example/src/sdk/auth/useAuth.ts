import { useCallback, useEffect, useState } from 'react';
import Web3 from 'web3';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { Web3Provider, ExternalProvider } from '@ethersproject/providers';
import { AbstractProvider } from 'web3-core';
import { QubicConnector } from '@qubic-js/react';

import { useQubicAuthConnector } from './useQubicAuthConnector';
import convertStringToHex from '../utils/convertStringToHex';

import {
  // API_KEY,
  // API_SECRET,
  // CREATOR_API,
  QUBIC_API_KEY,
  QUBIC_API_SECRET,
  QUBIC_CHAIN_ID,
  QUBIC_INFURA_PROJECT_ID,
} from '../constants/environment';

interface CustomizeProvider extends ExternalProvider {
  isQubic?: boolean;
}

let qubicConnector: QubicConnector;

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
      } catch (error) {
        console.error(error);
        console.error('簽章失敗');
      }
    },
    [account, currentProvider],
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
        name: 'OneOffs',
        url: 'https://nft.oneoffs.art',
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
