# Qubic creator SDK

## Usage

### JS

```ts
import QubicCreatorSdk from '@qubic-creator/core';

const qubicCreatorSdk = new QubicCreatorSdk({
  name: 'xxx',
  service: 'xxx',
  domain: 'xxx',
  key: 'xxx',
  secret: 'xxx',
  qubicWalletKey: 'xxx',
  qubicWalletSecret: 'xxx',
  infuraId: 'xxx',
  creatorUrl: 'xxx', //optional
  chainId: 'xxx', //optional
  tapPayMerchantId: 'xxx',
});
```

// 預設 style 顯示成 pop 中間

```ts
qubicCreatorSdk.createLoginPanel(element: HTMLElement, {
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
  containerStyle?: CSSStyle,
  backdropStyle?: CSSStyle,
  itemStyle?: CSSStyle, // each login button item
})


// payment form
const {setOrder} = qubicCreatorSdk.createPaymentForm(element: HTMLElement, {
  onPaymentDone: (error: Error | null, order?: Order) => void,
})

setOrder(yourOrderHere)
```

### React

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
      <LoginPanel onLogin={handleLogin} />
      {accessToken && <PaymentForm order={mockOrder} onPaymentDone={handlePaymentDone} />}
    </>
  );
}
```

## TODO

-
