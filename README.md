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
  name: 'Display Name', // 顯示你 dApp 的名稱，會出現在簽名的提示中
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
    console.log(error.message)
    console.log(error.status)
    console.log(error.statusText) // might be `''`
    console.log(error.body) // json object, ex: `{code: 404, message: 'resource not found'}`
  });

qubicConnect.onAuthStateChanged((user, error) => {
    if (error) {
      console.log(error.message)
      console.log(error.status)
      console.log(error.statusText) // might be `''`
      console.log(error.body)
    }
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

### Direct sign in without wallet provider

```
qubicConnect.loginWithRedirect();
```

### Sign in with different wallet providers

```
qubicConnect.loginWithRedirect({
  walletType: 'qubic', // 'metamask' | 'qubic' | 'walletconnect'
  qubicSignInProvider: 'google', // 'facebook' | 'google' | 'apple'
);
```

### Verify access token on the server side

#### GET /verify

```
https://auth.qubic.app/verify?access_token=${accessToken}&service=qubic-creator
```

_response example_

```
{
  "scope": "qubic-creator",
  "client_id": "9999",
  "address": "0x6CE72a0Db7534C286fF7b1C6D83028389aa17e56",
  "expires_in": 3596
}
```
