import './index.css';

import QubicCreatorSdk, { Currency } from '@qubic-creator/core';
import {
  CHAIN_ID,
  INFURA_ID,
  API_KEY,
  API_SECRET,
  CREATOR_API_URL,
  QUBIC_API_KEY,
  QUBIC_API_SECRET,
  QUBIC_WALLET_URL,
} from './environment';

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

const qubicCreatorSdk = new QubicCreatorSdk({
  name: 'Qubic Creator',
  service: 'qubee-creator',
  domain: 'creator.dev.qubic.market',
  key: API_KEY,
  secret: API_SECRET,
  qubicWalletUrl: QUBIC_WALLET_URL,
  qubicWalletKey: QUBIC_API_KEY,
  qubicWalletSecret: QUBIC_API_SECRET,
  creatorUrl: CREATOR_API_URL,
  chainId: parseInt(CHAIN_ID),
  infuraId: INFURA_ID,
});

function main() {
  let isFormRendered = false;
  function onAccessTokenChange(value?: string) {
    if (value && !isFormRendered) {
      isFormRendered = true;
      const { setOrder } = qubicCreatorSdk.createPaymentForm(document.getElementById('pay-form'), {
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

  qubicCreatorSdk.createLoginButton(document.getElementById('login-qubic'), {
    method: 'qubic',
    onLogin: (error, result) => {
      if (error) {
        window.alert(error.message);
        return;
      }
      onAccessTokenChange(result?.accessToken);
    },
  });

  qubicCreatorSdk.createLoginButton(document.getElementById('login-metamask'), {
    method: 'metamask',
    onLogin: (error, result) => {
      if (error) {
        window.alert(error.message);
        return;
      }
      onAccessTokenChange(result?.accessToken);
    },
  });

  qubicCreatorSdk.createLoginButton(document.getElementById('login-walletconnect'), {
    method: 'walletconnect',
    onLogin: (error, result) => {
      if (error) {
        window.alert(error.message);
        return;
      }
      console.log({ accessToken: result?.accessToken });
      onAccessTokenChange(result?.accessToken);
    },
  });

  qubicCreatorSdk.createLoginModal(document.getElementById('login-modal'), {
    methods: ['metamask', 'qubic', 'walletconnect'],
    onLogin: (error, result) => {
      if (error) {
        window.alert(error.message);
        return;
      }
      console.log({ accessToken: result?.accessToken });
      onAccessTokenChange(result?.accessToken);
    },
  });
}

main();
