# Qubic creator SDK

## Usage

### JS (direct sign in, without wallet provider)

```ts
import QubicCreatorSdk, { Currency, QubicCreatorConfig } from '@qubic-creator/core';

const qubicCreatorSdk = new QubicCreatorSdk({
  name: 'Display Name',
  service: 'service-name',
  key: 'API_KEY',
  secret: 'API_SECRET',
});

qubicCreatorSdk
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

qubicCreatorSdk.onAuthStateChanged(user => {
  if (!user) {
    console.log('user not logged in');
    return
  }
  onAccessTokenChange(user.accessToken);
});


document.getElementById('login')?.addEventListener('click', () => {
  qubicCreatorSdk.loginWithRedirect();
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

const ETHToTWDCurrencyData = await qubicCreatorSdk.requestGraphql({
  query: PRICE,
  variables: {
    fromCurrency: Currency.ETH,
    toCurrency: Currency.TWD,
  },
});

// you can fetch
// qubicCreatorSdk.fetch(path, options);

// or logout
// qubicCreatorSdk.logout();
```

### JS (with wallet provider)

```ts
import QubicCreatorSdk from '@qubic-creator/core';

const qubicCreatorSdk = new QubicCreatorSdk({
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
});
```

// 預設 style 顯示成 pop 中間

```ts
qubicCreatorSdk.createLoginModal(element: HTMLElement, {
  methods?: Array<'metamask','walletconnect' | 'qubic'>,
  onLogin: (
    error: Error,
    result: {
      type: 'metamask' | 'walletconnect' | 'qubic',
      address: string,
      accessToken: string,
      errorMessage: string,
      provider: ExternalProvider
    }
  ) => void,
  onLogout: () => void
  titleText?: string, // default: 'Connect your wallet'
  backdropStyle?: CSSStyle,
  itemStyle?: CSSStyle, // each login button item
})


// payment form
const {setOrder} = qubicCreatorSdk.createPaymentForm(element: HTMLElement, {
  onPaymentDone: (error: Error | null, order?: Order) => void,
})

setOrder(yourOrderHere)
```

### React (with wallet provider)

```tsx
import { QubicCreatorContextProvider } from '@qubic-creator/react';

function App() {
  return (
    <QubicCreatorContextProvider config={SDK_CONFIG}>
      <Demo />
    </QubicCreatorContextProvider>
  );
}
function Demo() {
  const [accessToken, setAccessToken] = useState('');

  const handlePaymentDone: OnPaymentDone = useCallback((error, result) => {
    if (error) {
      console.error(error.message);
      return;
    }
    console.log('PayFormResult', result);
  }, []);

  const handleLogin: OnLogin = useCallback((error, result) => {
    if (error) {
      console.error(error);
      return;
    }
    setAccessToken(result?.accessToken || '');
  }, []);

  return (
    <>
      <LoginModal onLogin={handleLogin} />
      {accessToken && <PaymentForm order={mockOrder} onPaymentDone={handlePaymentDone} />}
    </>
  );
}
```

### Api

#### fetch

```ts
const result = await qubicCreatorSdk.fetch('services/auth/revoke', {
  method: httpMethod,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});
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

const ETHToTWDCurrencyData = await qubicCreatorSdk.requestGraphql({
  query: PRICE,
  variables: {
    fromCurrency: Currency.ETH,
    toCurrency: Currency.TWD,
  },
});
```

## TODO

-
