import QubicProvider from '@qubic-js/browser';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { QubicCreatorConfig } from '@qubic-creator/core';
import { QubicCreatorContextProvider } from '@qubic-creator/react';
import { SDK_DEBUG_CONFIG } from './debugConfig';

import Demo from './Demo';
import './App.css';
import { INFURA_ID, API_KEY, API_SECRET } from './environment';

const SDK_CONFIG: QubicCreatorConfig = SDK_DEBUG_CONFIG || {
  name: 'Qubic Creator',
  service: 'qubee-creator',
  key: API_KEY,
  secret: API_SECRET,
  providerOptions: {
    qubic: {
      provider: new QubicProvider(),
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
