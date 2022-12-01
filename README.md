# Qubic Connect SDK

## Installation

### Install from NPM

```
$ npm install @qubic-connect/core
```

```
$ yarn add @qubic-connect/core
```

### Install from CDN

```
<script type="text/javascript" src="https://unpkg.com/@qubic-connect/core@0.4.1/dist/bundle.js"></script>
```

## Usage

### Initialize Qubic Connect

```ts
import QubicConnect, { Currency, QubicConnectConfig } from '@qubic-connect/core';

const qubicConnect = new QubicConnect({
  name: 'Display Name', // display name for user
  service: 'service-name',
  key: 'API_KEY',
  secret: 'API_SECRET',
});

qubicConnect
  .getRedirectResult()
  .then((user) {
    if (!user) {
      console.log('user not logged in');
      return
    }
    console.log('user logged in');
    console.log(user.address);
    console.log(user.accessToken);
    console.log(user.expiredAt);
  })
  .catch((error) {
    console.log(`login failed: ${error.message}`);
  });

qubicConnect.onAuthStateChanged(user => {
    if (!user) {
      console.log('user not logged in');
      return
    }
    console.log('user logged in');
    console.log(user.address);
    console.log(user.accessToken);
    console.log(user.expiredAt);
});
```



### Direct sign in, without wallet provider

```
qubicConnect.loginWithRedirect();
```

### Sign in, with different wallet provider

```
qubicConnect.loginWithRedirect({
  walletType: 'qubic', // 'metamask' | 'qubic' | 'walletconnect'
  qubicSignInProvider: 'google', // 'facebook' | 'google' | 'apple'
);
```
