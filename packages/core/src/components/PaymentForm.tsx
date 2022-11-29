import { CSSProperties, memo } from 'preact/compat';
import { useCallback, useEffect, useState } from 'preact/hooks';

import { OnPaymentDone } from '../types/QubicConnect';
import { Order } from '../types/Purchase';
import { useApi } from './ApiProvider';

const IFRAME_ID = 'payment-form-web-iframe';
const IFRAME_DOMAIN = 'http://payment-form-web.surge.sh';

export interface PaymentFormProps {
  style?: CSSProperties;
  width?: number;
  height?: number;
  getOrder: () => Order | undefined;
  onPaymentDone: OnPaymentDone;
}

const PaymentForm = memo<PaymentFormProps>(props => {
  const { getOrder, onPaymentDone, style, width = 300, height = 400 } = props;

  const [iframeLoaded, setIframeLoaded] = useState(false);

  const iframeOnLoad = useCallback(() => {
    setIframeLoaded(true);
  }, []);

  const { fetchBatchBuyAssetResult } = useApi();
  useEffect(() => {
    async function onMessageHandler(event: MessageEvent) {
      if (event.origin !== IFRAME_DOMAIN) return;

      const { data } = event;
      const order = getOrder();
      try {
        if (!data || !order) {
          return;
        }
        const { prime, userEmail, userName, userPhone, merchantId } = data;
        if (!prime || !userEmail || !userName || !userPhone) {
          return;
        }
        const {
          tokenId,
          assetImage,
          assetName,
          assetPrice,
          contractId,
          assetId,
          assetQuantity,
          assetBatchId,
          currency,
          stop3DValidation,
        } = order;

        const response = await fetchBatchBuyAssetResult({
          tokenId,
          assetImage,
          assetName,
          assetPrice,
          contractId,
          assetId,
          assetQuantity,
          assetBatchId,
          currency,
          userEmail,
          userName,
          userPhone,
          tapPayMerchantId: merchantId,
          stop3DValidation,
          tapPayPrime: prime,
        });

        onPaymentDone(null, response.batchBuyAsset);
      } catch (error) {
        if (error instanceof Error) {
          onPaymentDone(error);
        }
      }
    }

    window.addEventListener('message', onMessageHandler);

    return () => {
      window.removeEventListener('message', onMessageHandler);
    };
  }, [fetchBatchBuyAssetResult, getOrder, onPaymentDone]);

  useEffect(() => {
    if (iframeLoaded) {
      const iframeDOM = document.getElementById(IFRAME_ID) as HTMLIFrameElement;
      iframeDOM.contentWindow?.postMessage(
        {
          // primaryColor: 'red',
        },
        IFRAME_DOMAIN,
      );
    }
  }, [iframeLoaded]);

  return (
    <iframe
      id={IFRAME_ID}
      title="payment-form-web"
      src={IFRAME_DOMAIN}
      width={width}
      height={height}
      onLoad={iframeOnLoad}
      style={style}
    />
  );
});

export default PaymentForm;
