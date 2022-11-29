import QubicProvider from '@qubic-js/browser';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { QubicConnectConfig } from '@qubic-connect/core';
import { QubicConnectContextProvider } from '@qubic-connect/react';
import Demo from './Demo';
import './App.css';
import { INFURA_ID, API_KEY, API_SECRET, API_URL } from './environment';

const SDK_CONFIG: QubicConnectConfig = {
  name: 'Qubic Creator',
  service: 'qubee-creator',
  key: API_KEY,
  secret: API_SECRET,
  apiUrl: API_URL,
  authRedirectUrl: 'http://localhost:3001',
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
    <QubicConnectContextProvider config={SDK_CONFIG}>
      <Demo />
    </QubicConnectContextProvider>
  );
}

export default App;
