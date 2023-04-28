# Qubic Connect SDK

## Installation

### Install from NPM

```cli
npm install @qubic-connect/core
```

```cli
yarn add @qubic-connect/core
```

### Install from CDN

```ts
<script type="text/javascript" src="https://unpkg.com/@qubic-connect/core"></script>

<script type="text/javascript" >
const qubicConnect = QubicConnect.initialize({
  name: 'Display Name', // will show up in display
  key: 'API_KEY',
  secret: 'API_SECRET',
});
</script>
```

## Usage

### Initialize Qubic Connect

```ts
import QubicConnect from '@qubic-connect/core';

const qubicConnect = new QubicConnect({
  name: 'Display Name', // will show up in display
  key: 'API_KEY',
  secret: 'API_SECRET',
});

// user schema
// {
//   method: 'metamask' | 'qubic' | 'walletconnect' | 'custom' | 'redirect';
//   address: string;
//   accessToken: string;
//   expiredAt: number;
//   provider: ExtendedExternalProvider | null; // web3 provider
//   qubicUser?: {
//    provider: 'GOOGLE' | 'FACEBOOK' | 'TWITTER' | 'APPLE' | 'UNKNOWN';
//    email: string;
//    isKyc: boolean;
//  };
// }

// getRedirectResult only resolve user after redirecting
qubicConnect
  .getRedirectResult()
  .then(user => {
    if (!user) {
      console.log('user not logged in');
      return;
    }
    console.log('user logged in');
    console.log(user.address);
    console.log(user.accessToken);
    console.log(user.expiredAt);
  })
  .catch(error => {
    console.log(`login failed: ${error.message}`);
    console.log(error.message);
    console.log(error.status);
    console.log(error.statusText); // might be `''`
    console.log(error.body); // json object, ex: `{code: 404, message: 'resource not found'}`
  });

qubicConnect.onAuthStateChanged((user, error) => {
  if (error) {
    console.log(error.message);
    console.log(error.status);
    console.log(error.statusText); // might be `''`
    console.log(error.body);
  }
  if (!user) {
    console.log('user not logged in');
    return;
  }
  console.log('user logged in');
  console.log(user.address);
  console.log(user.accessToken);
  console.log(user.expiredAt);
});
```

### Direct sign in without wallet provider

```ts
qubicConnect.loginWithRedirect();
```

### Sign in with different wallet providers

```ts
qubicConnect.loginWithRedirect({
  walletType: 'qubic', // 'metamask' | 'qubic' | 'walletconnect'
  qubicSignInProvider: 'google', // 'facebook' | 'google' | 'apple'
);
```

### get current user

```ts
qubicConnect.getCurrentUser();
```

### Verify access token on the server side

#### GET /verify

```ts
https://auth.qubic.app/verify?access_token=${accessToken}&service=qubic-creator
```

_response example_

```ts
{
  "scope": "qubic-creator",
  "client_id": "9999",
  "address": "0x6CE72a0Db7534C286fF7b1C6D83028389aa17e56",
  "expires_in": 3596
}
```

## Related Repo

[https://github.com/getamis/qubic-auth](https://github.com/getamis/qubic-auth)
