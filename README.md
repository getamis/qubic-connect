# Qubic Connect SDK

## Installation

### Install from NPM

```
$ npm install @qubic-connect/core
```

```
$yarn add @qubic-connect/core
```

### Install from CDN

```
<script type="text/javascript" src="https://unpkg.com/@qubic-connect/core@0.4.1/dist/bundle.js"></script>
```

## Usage

### JS (direct sign in, without wallet provider)

```ts
import QubicConnect, { Currency, QubicConnectConfig } from '@qubic-connect/core';

const qubicConnect = new QubicConnect({
  name: 'Display Name', // display name for user
  service: 'service-name',
  key: 'API_KEY',
  secret: 'API_SECRET',
});

document.getElementById('login')?.addEventListener('click', () => {
  qubicConnect.loginWithRedirect();
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

after login success

```ts
const PRICE = gql`
  query PRICE_PUBLIC($fromCurrency: Currency!, $toCurrency: Currency!) {
    price(input: { fromCurrency: $fromCurrency, toCurrency: $toCurrency }) {
      fromCurrency
      toCurrency
      toCurrencyPrecision
      exchangeRate
      expiredAt
      signature
    }
  }
`;

const ETHToTWDCurrencyData = await qubicConnect.requestGraphql({
  query: PRICE,
  variables: {
    fromCurrency: Currency.ETH,
    toCurrency: Currency.TWD,
  },
});

// you can fetch
// qubicConnect.fetch(path, options);

// or logout
// qubicConnect.logout();
```

#### requestGraphql

```ts
import { gql } from 'graphql-request';

const PRICE = gql`
  query PRICE_PUBLIC($fromCurrency: Currency!, $toCurrency: Currency!) {
    price(input: { fromCurrency: $fromCurrency, toCurrency: $toCurrency }) {
      fromCurrency
      toCurrency
      toCurrencyPrecision
      exchangeRate
      expiredAt
      signature
    }
  }
`;

const ETHToTWDCurrencyData = await qubicConnect.requestGraphql({
  query: PRICE,
  variables: {
    fromCurrency: Currency.ETH,
    toCurrency: Currency.TWD,
  },
});
```
