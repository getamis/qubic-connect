import { useCallback, useEffect, useState } from 'react';
import { Currency, OnLogin, OnPaymentDone } from '@qubic-connect/core';
import { gql } from 'graphql-request';
import querystring from 'query-string';
import './App.css';

import { LoginButton, LoginModal, PaymentForm, useQubicConnect } from '@qubic-connect/react';

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
  const { qubicConnectRef } = useQubicConnect();

  useEffect(() => {
    qubicConnectRef.current.onAuthStateChanged(user => {
      console.log('onAuthStateChanged');
      console.log(user);
    });
  }, [qubicConnectRef]);

  useEffect(() => {
    qubicConnectRef.current
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
  }, [qubicConnectRef]);
  const handleGetPrice = useCallback(async () => {
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

    const ETHToTWDCurrencyData = await qubicConnectRef.current.requestGraphql({
      query: PRICE,
      variables: {
        fromCurrency: Currency.ETH,
        toCurrency: Currency.TWD,
      },
    });
    window.alert(JSON.stringify(ETHToTWDCurrencyData));
  }, [qubicConnectRef]);

  return (
    <div className="container">
      <div className="group">
        <p>{`<LoginButton />`}</p>
        <LoginButton method="qubic" onLogin={handleLogin} />
        <LoginButton method="metamask" onLogin={handleLogin} />
        <LoginButton method="walletconnect" onLogin={handleLogin} />
      </div>
      <div className="group">
        <p>{`<LoginModal />`}</p>
        <LoginModal methods={['qubic', 'metamask', 'walletconnect']} onLogin={handleLogin} />
      </div>

      <div className="group">
        <p>qubicConnect.loginWithRedirect</p>
        <button
          onClick={() => {
            qubicConnectRef.current.loginWithRedirect();
          }}
        >
          loginWithRedirect
        </button>
        {accessToken && (
          <button
            onClick={async () => {
              const exampleMessage = 'Example `personal_sign` message';
              const from = qubicConnectRef.current.address;
              const msg = `0x${Buffer.from(exampleMessage, 'utf8').toString('hex')}`;
              const signature = await qubicConnectRef.current.provider?.request?.({
                method: 'personal_sign',
                params: [msg, from, 'Example password'],
              });
              console.log({ signature });
            }}
          >
            Personal Sign
          </button>
        )}
        {accessToken && (
          <button
            onClick={() => {
              qubicConnectRef.current.logout();
            }}
          >
            logout
          </button>
        )}
      </div>

      <div className="group">
        <p>{`<PaymentForm />`}</p>
        {accessToken && <PaymentForm order={mockOrder} onPaymentDone={handlePaymentDone} />}
      </div>
      <div className="group">
        <p>requestGraphql</p>
        <button onClick={handleGetPrice}>Get Price</button>
      </div>
    </div>
  );
}

export default Demo;
