import { QubicConnect, Currency, QubicConnectConfig, SdkFetchError } from '@qubic-connect/core';
import { gql } from 'graphql-request';
import querystring from 'query-string';

import './index.css';
import { API_SERVICE_NAME, API_KEY, API_SECRET, API_URL, AUTH_REDIRECT_URL, VERIFY_URL } from './environment';

const SDK_CONFIG: QubicConnectConfig = {
  name: 'Qubic Creator', // a display name for future usage
  key: API_KEY,
  secret: API_SECRET,
  service: API_SERVICE_NAME, //optional
  apiUrl: API_URL, // optional
  authRedirectUrl: AUTH_REDIRECT_URL, // optional, for debug
};

function main() {
  const qubicConnect = new QubicConnect(SDK_CONFIG);

  // only work after redirection from previous page
  qubicConnect
    .getRedirectResult()
    .then(user => {
      console.log('getRedirectResult');
      console.log({ user });
      if (user === null) {
        // no redirect query parameters detected
        return;
      }
      window.alert('login success');
      const verifyUrl = querystring.stringifyUrl({
        url: VERIFY_URL, // https://auth.qubic.app/verify
        query: {
          access_token: user.accessToken,
          service: API_SERVICE_NAME,
        },
      });
      const answer = window.confirm('Open verify Url');
      if (answer) {
        window.open(verifyUrl, '_newWindow');
      }
    })
    .catch(error => {
      if (error instanceof SdkFetchError) {
        console.log(error.message);
        console.log(error.status);
        console.log(error.statusText);
        console.log(error.body);
        window.alert(`login failed: ${error.message}`);
      }
    });

  // work every time when auth state change and fist time loading
  qubicConnect.onAuthStateChanged((user, error) => {
    console.log('example onAuthStateChanged ');
    if (error) {
      console.log(error?.message);
      console.log(error?.status);
      console.log(error?.statusText);
      console.log(error?.body);
    }
    console.log({ user });
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

  const metamaskElm = document.getElementById('redirect-login-metamask');

  if (window.ethereum) {
    metamaskElm?.addEventListener('click', () => {
      qubicConnect.loginWithRedirect({
        walletType: 'metamask',
      });
    });
  } else {
    metamaskElm?.remove();
  }

  document.getElementById('redirect-login-walletconnect')?.addEventListener('click', () => {
    qubicConnect.loginWithRedirect({
      walletType: 'walletconnect',
    });
  });

  document.getElementById('redirect-login-qubic-google')?.addEventListener('click', () => {
    qubicConnect.loginWithRedirect({
      walletType: 'qubic',
      qubicSignInProvider: 'google',
    });
  });

  document.getElementById('redirect-login-qubic-apple')?.addEventListener('click', () => {
    qubicConnect.loginWithRedirect({
      walletType: 'qubic',
      qubicSignInProvider: 'apple',
    });
  });

  document.getElementById('redirect-login-qubic-facebook')?.addEventListener('click', () => {
    qubicConnect.loginWithRedirect({
      walletType: 'qubic',
      qubicSignInProvider: 'facebook',
    });
  });

  document.getElementById('logout')?.addEventListener('click', () => {
    qubicConnect.logout();
  });
}

main();
