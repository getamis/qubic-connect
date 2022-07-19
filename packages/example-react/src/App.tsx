import { useCallback, useState, useEffect, useRef } from 'react';
import QubicCreatorSdk from '@qubic-creator/core';
import { Currency } from '@qubic-creator/core/dist/types/price';
import { TappayResult } from '@qubic-creator/core/dist/api/purchase';
import './App.css';
import {
  CHAIN_ID,
  INFURA_ID,
  API_KEY,
  API_SECRET,
  CREATOR_API_URL,
  QUBIC_API_KEY,
  QUBIC_API_SECRET,
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
  qubicWalletKey: QUBIC_API_KEY,
  qubicWalletSecret: QUBIC_API_SECRET,
  creatorUrl: CREATOR_API_URL,
  chainId: parseInt(CHAIN_ID),
  infuraId: INFURA_ID,
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const qubicLoginButtonRef = useRef(null);
  const metamaskLoginButtonRef = useRef(null);
  const wcLoginButtonRef = useRef(null);
  const loginWithFullScreenModalButtonRef = useRef(null);
  const qubicPayIframeRef = useRef(null);
  // const [provider, setProvider] = useState(null);

  const isMountedRef = useRef(false);
  // strict mode caused useEffect called twice
  // https://stackoverflow.com/questions/61254372/my-react-component-is-rendering-twice-because-of-strict-mode/61897567#61897567

  const onPayFormResult = useCallback((result: TappayResult) => {
    console.log('PayFormResult', result);
    alert(`購買成功！ 結尾號碼為 ${result.tappay.cardInfo.lastFour}`);
  }, []);

  useEffect(() => {
    if (isMountedRef.current === true) {
      return;
    }
    isMountedRef.current = true;
    if (qubicLoginButtonRef.current) {
      qubicCreatorSdk.createLoginButton(qubicLoginButtonRef.current, {
        method: 'qubic',
        onLogin: (e: any, res: any) => {
          setIsLoggedIn(true);
          console.log({ accessToken: res.accessToken });
        },
      });
    }
    if (metamaskLoginButtonRef.current) {
      qubicCreatorSdk.createLoginButton(metamaskLoginButtonRef.current, {
        method: 'metamask',
        onLogin: (e: any, res: any) => {
          setIsLoggedIn(true);
          console.log({ accessToken: res.accessToken });
        },
      });
    }
    if (wcLoginButtonRef.current) {
      qubicCreatorSdk.createLoginButton(wcLoginButtonRef.current, {
        method: 'walletconnect',
        onLogin: () => {},
      });
    }
    if (loginWithFullScreenModalButtonRef.current) {
      qubicCreatorSdk.createLoginPanel(loginWithFullScreenModalButtonRef.current, {
        methods: ['qubic', 'metamask', 'walletconnect'],
        onLogin: () => {},
      });
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && qubicPayIframeRef.current && qubicCreatorSdk.accessToken) {
      const { setPaymentFormProps } = qubicCreatorSdk.createCreatorPaymentForm(
        qubicPayIframeRef.current,
        onPayFormResult,
      );

      setPaymentFormProps(mockData);
    }
  }, [isLoggedIn, onPayFormResult]);

  return (
    <div className="container">
      <div className="login-button-group">
        <div ref={qubicLoginButtonRef} className="login-button" />
        <div ref={metamaskLoginButtonRef} className="login-button" />
        <div ref={wcLoginButtonRef} className="login-button" />
        <div ref={loginWithFullScreenModalButtonRef} className="login-button" />
      </div>
      {qubicCreatorSdk.accessToken && <p className="hint">AccessToken: {qubicCreatorSdk.accessToken}</p>}
      {qubicCreatorSdk.accessToken && (
        <button className="logout-button" type="button" onClick={() => setIsLoggedIn(false)} disabled={!isLoggedIn}>
          Logout
        </button>
      )}
      <div ref={qubicPayIframeRef} />
    </div>
  );
}

export default App;
