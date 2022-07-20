# Qubic creator SDK

## Usage

```ts
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


// payment panel
qubicCreatorSdk.createPaymentPanel(element: HTMLElement, {
  onOrderCreated: (error: Error | null, order?: Order) => void,
})
```

## TODO

- try to cache createOrGetRoot for handling same element createRoot again
