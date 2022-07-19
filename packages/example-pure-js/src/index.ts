import './index.css';

import QubicCreatorSdk from '@qubic-creator/core';
import {
  CHAIN_ID,
  INFURA_ID,
  API_KEY,
  API_SECRET,
  CREATOR_API_URL,
  QUBIC_API_KEY,
  QUBIC_API_SECRET,
} from './environment';
import { Currency } from '@qubic-creator/core/dist/types/price';
import { TappayResult } from '@qubic-creator/core/dist/api/purchase';

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
      const { setPaymentFormProps } = qubicCreatorSdk.createCreatorPaymentForm(
        document.getElementById('pay-form'),
        (result: TappayResult) => {
          console.log('PayFormResult', result);
          alert(`購買成功！ 結尾號碼為 ${result.tappay.cardInfo.lastFour}`);
        },
      );

      setPaymentFormProps(mockData);
    }
  }

  qubicCreatorSdk.createLoginButton(document.getElementById('login-qubic'), {
    method: 'qubic',
    onLogin: (e, response) => {
      console.log({ accessToken: response?.accessToken });
      onAccessTokenChange(response?.accessToken);
    },
  });

  qubicCreatorSdk.createLoginButton(document.getElementById('login-metamask'), {
    method: 'metamask',
    onLogin: (e, response) => {
      console.log({ accessToken: response?.accessToken });
      onAccessTokenChange(response?.accessToken);
    },
  });

  qubicCreatorSdk.createLoginButton(document.getElementById('login-walletconnect'), {
    method: 'walletconnect',
    onLogin: (e, response) => {
      console.log({ accessToken: response?.accessToken });
      onAccessTokenChange(response?.accessToken);
    },
  });

  qubicCreatorSdk.createLoginPanel(document.getElementById('login-modal'), {
    methods: ['metamask', 'qubic', 'walletconnect'],
    onLogin: (e, response) => {
      console.log({ accessToken: response?.accessToken });
      onAccessTokenChange(response?.accessToken);
    },
  });
}

main();
