import Web3 from 'web3';
import { LoginMethod, useAuth } from '../auth/useAuth';
import { Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { Ethereumish } from '../types/ethereum';
import { QubicCreatorAuthConfig } from '../types/qubicCreator';
import { ReactElement } from 'react';

declare global {
  interface Window {
    ethereum: Ethereumish;
    web3: Web3;
  }
}

export interface CreatorLogin {
  type: 'metamask' | 'wallet_connect' | 'qubic';
  address: string;
  accessToken: string;
  errorMessage: string;
  provider: string; //ether.js
}

export interface CreatorSignInButtonProps {
  onLogin?: (param: CreatorLogin) => void;
  onLogout?: () => void;
}

interface CreatorSignInButton extends QubicCreatorAuthConfig {
  method: LoginMethod;
}

export const getWeb3Library = (provider: any): Web3Provider => {
  const { isQubic } = provider;
  return new ethers.providers.Web3Provider(isQubic ? provider : window.ethereum);
};

export function createCreatorSignInButtonElement(config: CreatorSignInButton) {
  const { name: authAppName, service: authServiceName, domain: authAppUrl, key, secret } = config;
  const keyPair = { key, secret };

  const SignInButton = (props: CreatorSignInButtonProps): ReactElement => {
    const { handleQubicLogin, authData } = useAuth({ authAppName, authAppUrl, authServiceName, keyPair });
    return (
      <button className="authbutton" onClick={handleQubicLogin}>
        Qubic Login
      </button>
    );
  };

  return SignInButton;
}
