# Qubic Connect - Advanced

## Usage

### JS (with wallet provider)

```ts
import QubicConnect from '@qubic-connect/core';

const wcProvider = (await EthereumProvider.init({
  projectId: '<WALLET CONNECT PROJECT ID>',
  showQrModal: true,
  chains: [1],
  methods: ['eth_sendTransaction', 'personal_sign'],
  events: ['chainChanged', 'accountsChanged'],
  metadata: {
    name: 'My Dapp',
    description: 'My Dapp description',
    url: 'https://my-dapp.com',
    icons: ['https://my-dapp.com/logo.png'],
  },
})) as any;

const qubicConnect = new QubicConnect({
  name: 'Display Name',
  service: 'service-name',
  key: 'API_KEY',
  secret: 'API_SECRET',
  providerOptions: {
    qubic: {
      provider: new QubicProvider(),
    },
    metamask: {
      provider: window.ethereum,
    },
    walletconnect: {
      provider: wcProvider,
    },
    custom: {
      display: {
        logo: 'https://commonwealth.maicoin.com/favicon.ico',
        name: 'Custom Injected',
      },
      provider: window.ethereum,
    },
  },
});
```
