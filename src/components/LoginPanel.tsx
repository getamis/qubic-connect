import Web3 from 'web3';
import React, { useEffect, useCallback, useState } from 'react';
import { LoginMethod, useAuth } from '../auth/useAuth';
import { Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { Ethereumish } from '../types/ethereum';
import { QubicCreatorAuthConfig } from '../types/qubicCreator';

import QubicLogo from '../assets/qubic-logo.svg';
import MetamaskFox from '../assets/metamask-fox.svg';
import WalletConnectCircle from '../assets/walletconnect-circle-blue.svg';

declare global {
  interface Window {
    ethereum: Ethereumish;
    web3: Web3;
  }
}

const iconMap: Record<LoginMethod, string> = {
  qubic: QubicLogo,
  metamask: MetamaskFox,
  // wallet_connect: WalletConnectCircle,
};

export interface CreatorLogin {
  type: LoginMethod;
  address: string;
  accessToken: string;
  provider?: string; //ether.js
}

export interface CreatorSignInButtonProps {
  onLogin?: (errorMessage: string | null, param: CreatorLogin) => void;
  onLogout?: () => void;
}

export interface SignInFullScreenModalProps extends CreatorSignInButtonProps {
  children: React.ReactNode[] | React.ReactNode;
}

interface CreatorSignInButton extends QubicCreatorAuthConfig {
  method: LoginMethod;
}

const styleButton = {
  width: '100%',
  borderRadius: '4px',
  border: 0,
  padding: '6px 16px',
  margin: '20px 0',
  outline: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const styleButtonWhiteTheme = {
  ...styleButton,
  color: '#212121',
  backgroundColor: '#fff',
};

const styleText = {
  fontFamily: 'Roboto, sans-serif',
  fontSize: '20px',
};

const icon = {
  width: '24px',
  height: '24px',
  marginRight: '8px',
};

export const getWeb3Library = (provider: any): Web3Provider => {
  const { isQubic } = provider;
  return new ethers.providers.Web3Provider(isQubic ? provider : window.ethereum);
};

export function createCreatorSignInButtonElement(config: CreatorSignInButton) {
  const { name: authAppName, service: authServiceName, domain: authAppUrl, key, secret } = config;
  const keyPair = { key, secret };

  const SignInButton = (props: CreatorSignInButtonProps): React.ReactElement => {
    const { handleQubicLogin, handleLoginMetaMask, accessToken, address } = useAuth({
      authAppName,
      authAppUrl,
      authServiceName,
      keyPair,
    });
    const buttonIcon = iconMap?.[config.method as LoginMethod] || '';
    const buttonText = useCallback(() => {
      switch (config.method) {
        case 'qubic':
          return 'Qubic Wallet';
        case 'metamask':
          return 'MetaMask';
        // case 'wallet_connect':
        //   return 'Wallet Connect';
      }
    }, []);
    const handleWalletLogin = useCallback(
      (ev: any): any => {
        ev?.preventDefault();
        ev?.stopPropagation();
        switch (config.method) {
          case 'qubic':
            return handleQubicLogin();
          case 'metamask':
            return handleLoginMetaMask();
          // case 'wallet_connect':
          //   return handleLoginWalletConnect();
        }
      },
      [handleLoginMetaMask, handleQubicLogin],
    );

    useEffect(() => {
      if (accessToken && address) {
        props.onLogin?.(null, {
          type: config.method,
          accessToken,
          address,
        });
      }
    });

    return (
      <button style={styleButtonWhiteTheme} onClick={handleWalletLogin}>
        <img style={icon} src={buttonIcon} alt="method-icon" />
        <span style={styleText}>{buttonText()}</span>
      </button>
    );
  };

  return SignInButton;
}

export const SignInFullScreen = ({ children }: SignInFullScreenModalProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const StyleFullScreenModal = {
    display: isVisible ? 'flex' : 'none',
    position: 'fixed' as React.CSSProperties['position'],
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  };

  const StyleBackdrop = {
    zIndex: -1,
    position: 'fixed' as React.CSSProperties['position'],
    width: '100vw',
    height: '100vh',
  };

  const handleVisibilitySwitch = useCallback(() => {
    setIsVisible(!isVisible);
  }, [isVisible]);

  return (
    <>
      <div style={StyleFullScreenModal}>
        <div style={StyleBackdrop} onClick={handleVisibilitySwitch}></div>
        <div>{children}</div>
      </div>
      <button onClick={handleVisibilitySwitch} style={styleButtonWhiteTheme}>
        <span style={styleText}> Login</span>
      </button>
    </>
  );
};
