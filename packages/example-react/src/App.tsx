import QubicProvider from '@qubic-js/browser';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { QubicCreatorConfig } from '@qubic-creator/core';
import { QubicCreatorContextProvider } from '@qubic-creator/react';
import Demo from './Demo';
import './App.css';
import { INFURA_ID, API_KEY, API_SECRET, CREATOR_API_URL } from './environment';

const SDK_CONFIG: QubicCreatorConfig = {
  name: 'Qubic Creator',
  service: 'qubee-creator',
  key: API_KEY,
  secret: API_SECRET,
  creatorUrl: CREATOR_API_URL,
  creatorAuthUrl: 'http://localhost:3001',
  providerOptions: {
    qubic: {
      provider: new QubicProvider(),
    },
    metamask: {
      provider: window.ethereum,
    },
    walletconnect: {
      provider: new WalletConnectProvider({
        infuraId: INFURA_ID,
      }),
    },
    custom: {
      display: {
        logo: 'https://commonwealth.maicoin.com/favicon.ico',
        name: 'Custom Injected',
      },
      provider: window.ethereum,
    },
  },
};

function App() {
  return (
    <QubicCreatorContextProvider config={SDK_CONFIG}>
      <Demo />
    </QubicCreatorContextProvider>
  );
}

export default App;
