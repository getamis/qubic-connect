# Qubic creator SDK

## Usage

```ts
const creatorHelper = new CreatorHelper({
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
});
```

// 預設 style 顯示成 pop 中間

```ts
createHelper.createLoginPanel(element: DomElement, {
  onLogin: (
    errorMessage: string,
    data: {
      type: 'metamask' | 'walletconnect' | 'qubic',
      address: string,
      accessToken: string,
      errorMessage: string,
      provider: ExternalProvider
    }
  ) => void,
  // onLogout: () => void
  titleText?: string, // default: 'Connect your wallet'
  containerStyle?: CSSStyle,
  backdropStyle?: CSSStyle,
  itemStyle?: CSSStyle,
})


// iframe
createHelper.createPaymentPanel(element: DomElement, {
  onOrderCreated: (order: Order) => void,
  onError: (errorMessage: string) => void
})
```

## TODO

- try to cache createOrGetRoot for handling same element createRoot again
