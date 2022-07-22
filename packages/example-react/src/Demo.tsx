import { useCallback, useState } from 'react';
import { Currency, OnLogin, OnPaymentDone } from '@qubic-creator/core';
import './App.css';

import { LoginButton, LoginModal, PaymentForm } from '@qubic-creator/react';

const mockOrder = {
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

function Demo() {
  const [accessToken, setAccessToken] = useState('');

  const handlePaymentDone: OnPaymentDone = useCallback((error, result) => {
    if (error) {
      window.alert(error.message);
      return;
    }
    console.log('PayFormResult', result);
    alert(`購買成功！ 結尾號碼為 ${result?.tappay.cardInfo.lastFour}`);
  }, []);

  const handleLogin: OnLogin = useCallback((error, result) => {
    if (error) {
      window.alert(error);
      return;
    }
    setAccessToken(result?.accessToken || '');
  }, []);

  return (
    <div className="container">
      <div className="group">
        <p>{`<LoginButton />`}</p>
        <LoginButton style={{ backgroundColor: 'red' }} method="qubic" onLogin={handleLogin} />
        <LoginButton method="metamask" onLogin={handleLogin} />
        <LoginButton method="walletconnect" onLogin={handleLogin} />
      </div>
      <div className="group">
        <p>{`<LoginModal />`}</p>
        <LoginModal methods={['qubic', 'metamask', 'walletconnect']} onLogin={handleLogin} />
      </div>
      <div className="group">
        <p>{`<PaymentForm />`}</p>
        {accessToken && <PaymentForm order={mockOrder} onPaymentDone={handlePaymentDone} />}
      </div>
    </div>
  );
}

export default Demo;
