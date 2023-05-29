import { PaymentLocale } from './../../../packages/core/src/types/Asset';
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
  MARKET_API_URL,
  AUTH_REDIRECT_URL,
  VERIFY_URL,
  INFURA_ID,
  QUBIC_WALLET_URL,
  MOCK_BIND_SERVICE_API,
  QUBIC_PASS_URL,
  MOCK_LOGIN_SERVICE_API,
} from './environment';
import { GET_ASSET_DETAIL } from './gqlSchema/assets';
import { AssetBuyOptionInput, CurrencyForAsset } from '@qubic-connect/core/dist/types/Asset';
import { Credential } from '@qubic-connect/core/dist/types/QubicConnect';

const SDK_CONFIG: QubicConnectConfig = {
  name: 'Qubic Creator', // a display name for future usage
  key: API_KEY,
  secret: API_SECRET,
  service: API_SERVICE_NAME, //optional
  apiUrl: API_URL, // optional
  marketApiUrl: MARKET_API_URL,
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
    }
    console.log({ user });
  });

  async function sendBindTicketToClientServer(input: {
    bindTicket: string;
    memberId: string;
  }): Promise<{ success: boolean }> {
    // server will use bindTicket to exchange for prime, GQL primeGet(bindTicket)
    // prime is a value for user to exchange credential
    // lifecycle of prime is forever, you should keep it safely
    const bindResponse = await fetch(`${MOCK_BIND_SERVICE_API}/primeBind`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `bindTicket=${input.bindTicket}&memberId=${input.memberId}`,
    });
    if (!bindResponse.ok) {
      throw Error(await bindResponse.text());
    }
    const bindData = (await bindResponse.json()) as {
      success: boolean;
    };
    return bindData;
  }

  async function loginClientServer(input: { memberId: string }): Promise<{
    id: string;
    name: string;
    credential: Credential;
  }> {
    // login to client server
    // in the login process you should also called GQL credentialIssue, use prime to get credential
    // and response it with user data
    const credentialIssueResponse = await fetch(`${MOCK_LOGIN_SERVICE_API}/credentialIssue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `memberId=${input.memberId}`,
    });
    if (!credentialIssueResponse.ok) {
      throw Error(await credentialIssueResponse.text());
    }

    const credential = (await credentialIssueResponse.json()) as Credential;
    return {
      id: input.memberId,
      name: 'member name:' + input.memberId,
      credential,
    };
  }

  qubicConnect.onBindTicketResult(async (bindTicketResult, error) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1));
      console.log('example onBindTicketResult ');
      if (error) {
        console.log(error?.message);
        throw error;
      }
      console.log({ bindTicketResult });
      const memberId = window.prompt('bindTicketResult done, what memberId number do you want?');
      if (!bindTicketResult) throw Error('no bind ticket result');
      if (!memberId) throw Error('no memberId');

      const { success } = await sendBindTicketToClientServer({
        bindTicket: bindTicketResult.bindTicket,
        memberId,
      });
      if (!success) throw Error('success failed');
      window.alert(`success bind, now you can login with memberId ${memberId}`);
    } catch (error) {
      if (error instanceof Error) {
        window.alert(error.message);
      }
    }
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
      path: '/services/graphql-acc',
      query: PRICE,
      variables: {
        fromCurrency: Currency.ETH,
        toCurrency: Currency.TWD,
      },
    });
    window.alert(JSON.stringify(ETHToTWDCurrencyData));
  });

  async function buyAsset(locale?: PaymentLocale) {
    let assetId = prompt('Please enter assetId', '') || '';

    if (!assetId) {
      throw new Error('no buyable asset');
    }

    const assetDetail = await qubicConnect.requestGraphql({
      path: '/services/graphql-acc',
      query: GET_ASSET_DETAIL,
      variables: {
        assetId,
        disableSurge: false,
        paymentMode: 'FIAT',
      },
    });

    if (assetDetail) {
      let purchaseCode = '';
      let beGift = false;

      if (assetDetail.getAssetDetail.salePhases?.[0]?.mode === 'PURCHASE_CODE') {
        purchaseCode = prompt('Please enter purchaseCode', '') || '';
      }

      if (assetDetail.getAssetDetail.giftable) {
        beGift = prompt('Is this a gift? input true / false', '') === 'true';
      }

      const assetBuyInput = {
        asset: {
          assetId,
          currency: CurrencyForAsset.TWD,
          price: assetDetail.getAssetDetail.batchAsset.price,
          quantity: 1,
          variantId: assetDetail.getAssetDetail.batchAssets[0].batchId,
        },
        payCallback: {
          failureRedirectUrl: 'https://creator-demo.dev.qubic.market/orders',
          pendingRedirectUrl: 'https://creator-demo.dev.qubic.market/orders',
          successRedirectUrl: 'https://creator-demo.dev.qubic.market/orders',
        },
        requestId: uuidv4(),
        option: {} as AssetBuyOptionInput,
      };

      if (purchaseCode) {
        assetBuyInput.option.purchaseCode = purchaseCode;
      }

      if (beGift) {
        assetBuyInput.option.beGift = true;
      }

      const assetBuyResult = await qubicConnect.buyAssetAndCreateCheckout(assetBuyInput, { locale });

      console.log('assetBuyResult', assetBuyResult);

      return assetBuyResult;
    }

    return null;
  }

  async function giftRedeem(locale?: PaymentLocale) {
    let giftTicket = prompt('Please enter giftTicket', '') || '';

    if (!giftTicket) {
      throw new Error('no gift ticket');
    }

    const giftRedeemInput = {
      requestId: uuidv4(),
      giftTicket,
      payCallback: {
        failureRedirectUrl: 'https://creator-demo.dev.qubic.market/orders',
        pendingRedirectUrl: 'https://creator-demo.dev.qubic.market/orders',
        successRedirectUrl: 'https://creator-demo.dev.qubic.market/orders',
      },
    };

    const giftRedeemResult = await qubicConnect.giftRedeem(giftRedeemInput, { locale });

    console.log('AAA, giftRedeemResult', giftRedeemResult);

    return giftRedeemResult;
  }

  async function checkDomainAndGo(locale?: PaymentLocale, isGift = false) {
    let checkoutInfo = undefined;
    if (isGift) {
      const response = await giftRedeem(locale);
      checkoutInfo = response?.giftRedeem;
    } else {
      const response = await buyAsset(locale);
      checkoutInfo = response?.assetBuy;
    }

    if (!checkoutInfo) return;

    try {
      const assetDomain = prompt('Please enter domain', 'http://localhost:3000');

      if (!assetDomain) {
        return null;
      }

      const { pathname, search } = new URL(checkoutInfo.paymentUrl);
      window.location.href = `${assetDomain}${pathname}${search}`;
    } catch (e) {
      console.error(e);
    }
  }

  const assetBuyDom = document.querySelector('#asset-buy');

  assetBuyDom?.addEventListener('click', async () => {
    checkDomainAndGo();
  });

  const assetBuyLocaleDom = document.querySelector('#asset-buy-locale');

  assetBuyLocaleDom?.addEventListener('click', async () => {
    const locale = (prompt('Please enter locale', 'zh') as PaymentLocale) || undefined;
    await checkDomainAndGo(locale);
  });

  const giftRedeemDom = document.querySelector('#gift-redeem');

  giftRedeemDom?.addEventListener('click', async () => {
    checkDomainAndGo(undefined, true);
  });

  document.getElementById('redirect-login')?.addEventListener('click', () => {
    qubicConnect.loginWithRedirect();
  });

  document.getElementById('redirect-bind')?.addEventListener('click', () => {
    qubicConnect.bindWithRedirect();
  });

  document.getElementById('bind-mock-login')?.addEventListener('click', async () => {
    const memberId = window.prompt('what memberId you want to login');
    try {
      if (!memberId) throw Error('no memberId');
      const member = await loginClientServer({ memberId });
      const user = await qubicConnect.loginWithCredential(member.credential);
      window.alert('user login in:' + JSON.stringify(user));
    } catch (error) {
      if (error instanceof Error) {
        window.alert(error.message);
      }
    }
  });

  document.getElementById('redirect-login-metamask')?.addEventListener('click', () => {
    qubicConnect.loginWithRedirect({
      walletType: 'metamask',
    });
  });

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

  document.getElementById('get-user-wallet-collectible-url')?.addEventListener('click', () => {
    const url = qubicConnect.getUserQubicWalletCollectibleUrl(QUBIC_WALLET_URL);
    if (!url) {
      window.alert('url not found');
      return;
    }
    window.open(url);
  });

  document.getElementById('get-user-pass-url')?.addEventListener('click', () => {
    const url = qubicConnect.getUserPassUrl(QUBIC_PASS_URL);
    if (!url) {
      window.alert('url not found');
      return;
    }
    window.open(url);
  });
}

main();
