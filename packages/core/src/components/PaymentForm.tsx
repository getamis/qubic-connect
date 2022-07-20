import { CSSProperties, FunctionComponent, memo } from 'preact/compat';
import { useCallback, useEffect, useState } from 'preact/hooks';

import { QubicCreatorConfig, OnPaymentDone } from '../types/QubicCreator';
import { Order } from '../types/Purchase';
import { getBatchBuyAssetResult } from '../api/purchase';

const IFRAME_ID = 'payment-form-web-iframe';
const IFRAME_DOMAIN = 'http://payment-form-web.surge.sh';

export interface PaymentFormProps {
  containerStyle?: CSSProperties;
  containerWidth?: number;
  containerHeight?: number;
  getOrder: () => Order | undefined;
  onPaymentDone: OnPaymentDone;
}

export function createPaymentFormElement(sdkConfig: QubicCreatorConfig): FunctionComponent<PaymentFormProps> {
  const { key: apiKey, secret: apiSecret } = sdkConfig;

  const PaymentForm = memo<PaymentFormProps>(props => {
    const { getOrder, onPaymentDone, containerStyle, containerWidth = 300, containerHeight = 400 } = props;

    const [iframeLoaded, setIframeLoaded] = useState(false);

    const iframeOnLoad = useCallback(() => {
      setIframeLoaded(true);
    }, []);

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

          const response = await getBatchBuyAssetResult({
            apiKey,
            apiSecret,
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
    }, [getOrder, onPaymentDone]);

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
        width={containerWidth}
        height={containerHeight}
        onLoad={iframeOnLoad}
        style={containerStyle}
      />
    );
  });

  return PaymentForm;
}
