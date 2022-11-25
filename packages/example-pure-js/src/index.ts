import QubicProvider from '@qubic-js/browser';
import WalletConnectProvider from '@walletconnect/web3-provider';
import QubicConnect, { Currency, QubicConnectConfig } from '@qubic-connect/core';
import { gql } from 'graphql-request';
import querystring from 'query-string';

import './index.css';
import { INFURA_ID, API_KEY, API_SECRET, API_URL, AUTH_REDIRECT_URL } from './environment';

const SDK_CONFIG: QubicConnectConfig = {
  name: 'Qubic Creator',
  service: 'qubee-creator',
  key: API_KEY,
  secret: API_SECRET,
  apiUrl: API_URL,
  authRedirectUrl: AUTH_REDIRECT_URL,
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
};
const qubicConnect = new QubicConnect(SDK_CONFIG);

qubicConnect
  .getRedirectResult()
  .then(result => {
    console.log('getRedirectResult');
    console.log({ result });
    if (result === null) {
      // no redirect query parameters detected
      return;
    }
    window.alert('login success');
    const verifyUrl = querystring.stringifyUrl({
      url: 'https://auth.dev.qubics.org/verify',
      query: {
        access_token: result.accessToken,
        service: 'qubic-creator',
      },
    });
    const answer = window.confirm('Open verify Url');
    if (answer) {
      window.open(verifyUrl, '_newWindow');
    }
  })
  .catch(error => {
    if (error instanceof Error) {
      window.alert(`login failed: ${error.message}`);
    }
  });

const mockData = {
  tokenId: undefined,
  assetImage:
    'https://storage.dev.qubic.market/80001/0x235e9d7356852fea0488317f9c5786e487f9198c/2/images/image_original.jpg',
  assetName: '幸福的咖啡豆和麻布袋',
  assetPrice: 1200,
  contractId: undefined,
  assetId: 4155,
  assetQuantity: 2,
  assetBatchId: undefined,
  currency: Currency.TWD,
  tapPayMerchantId: 'AMIS_TAISHIN',
  stop3DValidation: false,
};

function main() {
  let isFormRendered = false;

  function onAccessTokenChange(value?: string) {
    if (value && !isFormRendered) {
      isFormRendered = true;
      const { setOrder } = qubicConnect.createPaymentForm(document.getElementById('pay-form'), {
        onPaymentDone: (error, result) => {
          console.log('PayFormResult', result);
          if (error) {
            window.alert(error.message);
            return;
          }
          window.alert(`購買成功！ 結尾號碼為 ${result?.tappay.cardInfo.lastFour}`);
        },
      });

      setOrder(mockData);
    }
  }

  qubicConnect.onAuthStateChanged(user => {
    console.log('example onAuthStateChanged ');
    console.log(user);

    onAccessTokenChange(user?.accessToken);
  });

  qubicConnect.createLoginButton(document.getElementById('login-qubic'), {
    method: 'qubic',
    onLogin: (error, result) => {
      if (error) {
        window.alert(error.message);
        return;
      }
    },
  });

  qubicConnect.createLoginButton(document.getElementById('login-metamask'), {
    method: 'metamask',
    onLogin: (error, result) => {
      if (error) {
        window.alert(error.message);
        return;
      }
    },
  });

  qubicConnect.createLoginButton(document.getElementById('login-walletconnect'), {
    method: 'walletconnect',
    onLogin: (error, result) => {
      if (error) {
        window.alert(error.message);
        return;
      }
      console.log({ accessToken: result?.accessToken });
    },
  });

  qubicConnect.createLoginModal(document.getElementById('login-modal'), {
    methods: ['metamask', 'qubic', 'walletconnect', 'custom'],
    onLogin: (error, result) => {
      if (error) {
        window.alert(error.message);
        return;
      }
      console.log({ accessToken: result?.accessToken });
    },
  });

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

  const priceDom = document.querySelector('#price');
  priceDom?.addEventListener('click', async () => {
    const ETHToTWDCurrencyData = await qubicConnect.requestGraphql({
      query: PRICE,
      variables: {
        fromCurrency: Currency.ETH,
        toCurrency: Currency.TWD,
      },
    });
    window.alert(JSON.stringify(ETHToTWDCurrencyData));
  });

  document.getElementById('redirect-login')?.addEventListener('click', () => {
    qubicConnect.loginWithRedirect();
  });

  document.getElementById('logout')?.addEventListener('click', () => {
    qubicConnect.logout();
  });

  document.getElementById('personal-sign')?.addEventListener('click', async () => {
    const exampleMessage = 'Example `personal_sign` message';
    const from = qubicConnect.address;
    const msg = `0x${Buffer.from(exampleMessage, 'utf8').toString('hex')}`;
    const signature = await qubicConnect.provider?.request?.({
      method: 'personal_sign',
      params: [msg, from, 'Example password'],
    });
    console.log({ signature });
  });
}

main();
