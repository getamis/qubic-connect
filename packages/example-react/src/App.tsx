import { QubicCreatorConfig } from '@qubic-creator/core';
import { QubicCreatorContextProvider } from '@qubic-creator/react';
import Demo from './Demo';
import './App.css';
import {
  CHAIN_ID,
  INFURA_ID,
  API_KEY,
  API_SECRET,
  CREATOR_API_URL,
  QUBIC_API_KEY,
  QUBIC_API_SECRET,
  QUBIC_WALLET_URL,
} from './environment';

const SDK_CONFIG: QubicCreatorConfig = {
  name: 'Qubic Creator',
  service: 'qubee-creator',
  domain: 'creator.dev.qubic.market',
  key: API_KEY,
  secret: API_SECRET,
  qubicWalletUrl: QUBIC_WALLET_URL,
  qubicWalletKey: QUBIC_API_KEY,
  qubicWalletSecret: QUBIC_API_SECRET,
  creatorUrl: CREATOR_API_URL,
  chainId: parseInt(CHAIN_ID),
  infuraId: INFURA_ID,
};

function App() {
  return (
    <QubicCreatorContextProvider config={SDK_CONFIG}>
      <Demo />
    </QubicCreatorContextProvider>
  );
}

export default App;
