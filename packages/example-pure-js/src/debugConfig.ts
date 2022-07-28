import {
  DEBUG,
  CHAIN_ID,
  INFURA_ID,
  API_KEY,
  API_SECRET,
  CREATOR_API_URL,
  QUBIC_API_KEY,
  QUBIC_API_SECRET,
  QUBIC_WALLET_URL,
} from './environment';
import QubicProvider from '@qubic-js/browser';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { QubicCreatorConfig } from '@qubic-creator/core';

export const SDK_DEBUG_CONFIG: QubicCreatorConfig | null = DEBUG
  ? {
      name: 'Qubic Creator',
      service: 'qubee-creator',
      key: API_KEY,
      secret: API_SECRET,
      creatorUrl: CREATOR_API_URL,
      providerOptions: {
        qubic: {
          provider: new QubicProvider({
            chainId: CHAIN_ID,
            walletUrl: QUBIC_WALLET_URL,
            apiKey: QUBIC_API_KEY,
            apiSecret: QUBIC_API_SECRET,
          }) as any,
        },
        metamask: {
          provider: window.ethereum,
        },
        walletconnect: {
          provider: new WalletConnectProvider({
            chainId: CHAIN_ID,
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
    }
  : null;
