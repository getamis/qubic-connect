import {
  QubicConnect,
  Currency,
  QubicConnectConfig,
  SdkFetchError,
  CurrencyForAsset,
  Credential,
  PaymentLocale,
} from '@qubic-connect/core';
import QubicProvider from '@qubic-js/browser';
import { gql } from 'graphql-request';
import querystring from 'query-string';
import { v4 as uuidv4 } from 'uuid';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

import './index.css';
import {
  API_SERVICE_NAME,
  API_KEY,
  API_SECRET,
  API_URL,
  MARKET_API_URL,
  AUTH_REDIRECT_URL,
  VERIFY_URL,
  QUBIC_WALLET_URL,
  MOCK_BIND_SERVICE_API,
  QUBIC_PASS_URL,
  MOCK_LOGIN_SERVICE_API,
  QUBIC_PAYMENT_HOST,
} from './environment';
import { AssetDetail, GET_ASSET_DETAIL } from './gqlSchema/assets';
import { AssetBuyInput } from '@qubic-connect/core';

async function main() {
  const wcProvider = await EthereumProvider.init({
    projectId: '0454e00195752e67920ca71728e21b30',
    showQrModal: true,
    chains: [1, 5, 137, 80001, 56, 97],
    methods: ['eth_sendTransaction', 'personal_sign'],
    events: ['chainChanged', 'accountsChanged'],
    metadata: {
      name: 'My Dapp',
      description: 'My Dapp description',
      url: 'https://my-dapp.com',
      icons: ['https://my-dapp.com/logo.png'],
    },
  });

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
        provider: wcProvider as any,
      },
    },
  };

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

    let privateSaleCode = prompt('Private sale code?');
    const response = await qubicConnect.marketRequestGraphql<{ asset: AssetDetail }>({
      query: GET_ASSET_DETAIL,
      variables: {
        assetId,
        ...(privateSaleCode && { privateSaleCode }),
      },
    });

    if (response) {
      let beGift = false;

      if (response.asset.saleData.gift?.expiredDays) {
        beGift = prompt('Is this a gift? input true / false', '') === 'true';
      }

      let assetVariantIndex = 0;
      if (response.asset.saleData.variants.length > 1) {
        assetVariantIndex = Number(
          prompt(`Enter asset variant index [0~${response.asset.saleData.variants.length - 1}]`),
        );
      }

      const assetVariant = response.asset.saleData.variants[assetVariantIndex];
      const test = window.prompt('Type `yes` to dry run test')?.toLocaleLowerCase() === 'yes';

      const assetBuyInput: AssetBuyInput = {
        asset: {
          assetVariantId: assetVariant.id,
          currency: CurrencyForAsset.TWD,
          price: assetVariant.price,
          quantity: 1,
        },
        payCallback: {
          failureRedirectUrl: 'https://creator-demo.dev.qubic.market/orders',
          pendingRedirectUrl: 'https://creator-demo.dev.qubic.market/orders',
          successRedirectUrl: 'https://creator-demo.dev.qubic.market/orders',
        },
        requestId: uuidv4(),
        test,
        option: {
          ...(privateSaleCode && { privateSaleCode }),
          ...(beGift && { beGift: true }),
        },
      };

      const assetBuyResult = await qubicConnect.buyAssetAndCreateCheckout(assetBuyInput, { locale });

      console.log('assetBuyResult', assetBuyResult);

      return assetBuyResult;
    }

    return null;
  }

  async function giftRedeem(locale?: PaymentLocale) {
    let giftCode = prompt('Please enter giftCode', '') || '';

    if (!giftCode) {
      throw new Error('no gift ticket');
    }

    const giftRedeemInput = {
      requestId: uuidv4(),
      giftCode,
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

    if (!checkoutInfo?.paymentUrl) return;

    try {
      // if you want to debug payment web in localhost
      if (QUBIC_PAYMENT_HOST) {
        const { pathname, search } = new URL(checkoutInfo.paymentUrl);
        window.location.href = `${QUBIC_PAYMENT_HOST}${pathname}${search}`;
      }

      window.location.href = checkoutInfo.paymentUrl;
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

  document.getElementById('get-user-wallet-url')?.addEventListener('click', () => {
    const url = qubicConnect.getUserQubicWalletUrl({
      walletUrl: QUBIC_WALLET_URL,
      nextPath: '/assets/list',
    });

    if (!url) {
      window.alert('url not found');
      return;
    }
    window.open(url);
  });

  document.getElementById('get-user-pass-url')?.addEventListener('click', () => {
    const url = qubicConnect.getUserQubicPassUrl({
      passUrl: QUBIC_PASS_URL,
      nextPath: '/collectibles',
    });
    if (!url) {
      window.alert('url not found');
      return;
    }
    window.open(url);
  });
}

main();
