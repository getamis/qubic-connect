import { Root } from 'react-dom/client';
import Web3 from 'web3';
import useAuth from '../auth/useAuth';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { Ethereumish } from '../types/ethereum';

declare global {
  interface Window {
    ethereum: Ethereumish;
    web3: Web3;
  }
}

const web3library = (provider: any): Web3Provider => {
  const { isQubic } = provider;
  return new ethers.providers.Web3Provider(isQubic ? provider : window.ethereum);
};

const LoginPanel = () => {
  const { handleLogin } = useAuth();
  return <button onClick={handleLogin}>Login</button>;
};

export function createLoginPanelComponent(ReactRootElement: Root, { onLogin = () => {} }) {
  ReactRootElement.render(
    <Web3ReactProvider getLibrary={web3library}>
      <LoginPanel />
    </Web3ReactProvider>,
  );
}
