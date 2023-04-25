import { QubicConnect, Currency, QubicConnectConfig, SdkFetchError } from '@qubic-connect/core';
import QubicProvider from '@qubic-js/browser';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { gql } from 'graphql-request';
import querystring from 'query-string';
import { v4 as uuidv4 } from 'uuid';

import './index.css';
import {
  API_SERVICE_NAME,
  API_KEY,
  API_SECRET,
  API_URL,
  CHECKOUT_API_URL,
  AUTH_REDIRECT_URL,
  VERIFY_URL,
  INFURA_ID,
  QUBIC_WALLET_URL,
} from './environment';
import { GET_ASSET_DETAIL, LIST_ASSETS_V2 } from './gqlSchema/assets';
import { CurrencyForAsset } from '@qubic-connect/core/dist/types/Asset';

const SDK_CONFIG: QubicConnectConfig = {
  name: 'Qubic Creator', // a display name for future usage
  key: API_KEY,
  secret: API_SECRET,
  service: API_SERVICE_NAME, //optional
  apiUrl: API_URL, // optional
  checkoutApiUrl: CHECKOUT_API_URL,
  authRedirectUrl: AUTH_REDIRECT_URL, // optional, for debug
  iabRedirectUrl: '', // optional
  shouldAlwaysShowCopyUI: false, // optional
  providerOptions: {
    qubic: {
      provider: new QubicProvider({
        walletUrl: QUBIC_WALLET_URL,
        enableIframe: true,
        disableIabWarning: true,
      }),
    },
    metamask: {
      provider: window.ethereum,
    },
    walletconnect: {
      provider: new WalletConnectProvider({
        infuraId: INFURA_ID,
      }),
    },
  },
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

  const assetBuyDom = document.querySelector('#asset-buy');
  assetBuyDom?.addEventListener('click', async () => {
    try {
      const listAssets = await qubicConnect.requestGraphql({
        query: LIST_ASSETS_V2,
        variables: {
          disableSurge: false,
          first: 30,
          offset: 0,
          onlyAvailable: false,
          paymentMode: "FIAT",
          searchText: "",
          sort: "SORT_BY_PUBLISH_TIME_DESC",
          tags: [],
        }
      });

      const firstBuyableListAsset = listAssets?.listAssetsV2?.assets.find((asset: { saleState: string; }) => asset.saleState === 'BUY');

      if (firstBuyableListAsset) {
        const assetDetail = await qubicConnect.requestGraphql({
          query: GET_ASSET_DETAIL,
          variables: {
            assetId: firstBuyableListAsset.assetId,
            disableSurge: false,
            paymentMode: "FIAT",
          }
        });

        if (assetDetail) {
          const assetBuyInput = {
            asset: {
              assetId: firstBuyableListAsset.assetId,
              currency: CurrencyForAsset.TWD,
              price: assetDetail.getAssetDetail.batchAsset.price,
              quantity: 1,
              variantId: assetDetail.getAssetDetail.batchAssets[0].batchId,
            },
            payCallback: {
              failureRedirectUrl: "https://www.google.com",
              pendingRedirectUrl: "https://www.google.com",
              successRedirectUrl: "https://www.google.com",
            },
            requestId: uuidv4(),
          };

          const assetBuyResult = await qubicConnect.buyAssetAndCreateCheckout(assetBuyInput);

          console.log('assetBuyResult', assetBuyResult)
        } 
      }
    } catch (e) {
      console.error(e);
    }
  })

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

  document.getElementById('redirect-login-qubic-yahoo')?.addEventListener('click', () => {
    qubicConnect.loginWithRedirect({
      walletType: 'qubic',
      qubicSignInProvider: 'yahoo',
    });
  });

  Array.from(document.getElementsByClassName('logout')).forEach(button => {
    button.addEventListener('click', () => {
      qubicConnect.logout();
    });
  });

  document.getElementById('login-metamask')?.addEventListener('click', () => {
    qubicConnect.loginWithWallet('metamask');
  });

  document.getElementById('login-walletconnect')?.addEventListener('click', () => {
    qubicConnect.loginWithWallet('walletconnect');
  });

  document.getElementById('login-qubic')?.addEventListener('click', () => {
    qubicConnect.provider?.request?.({
      method: 'eth_requestAccounts',
    });
  });

  document.getElementById('login-qubic-google')?.addEventListener('click', () => {
    qubicConnect.loginWithWallet('qubic', 'google');
  });

  document.getElementById('login-qubic-facebook')?.addEventListener('click', () => {
    qubicConnect.loginWithWallet('qubic', 'facebook');
  });

  document.getElementById('login-qubic-apple')?.addEventListener('click', () => {
    qubicConnect.loginWithWallet('qubic', 'apple');
  });

  document.getElementById('login-qubic-yahoo')?.addEventListener('click', () => {
    qubicConnect.loginWithWallet('qubic', 'yahoo');
  });

  document.getElementById('get-current-user')?.addEventListener('click', () => {
    console.log({ currentUser: qubicConnect.getCurrentUser() });
  });
}

main();
