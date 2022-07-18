import { memo } from 'preact/compat';
import { useCallback, useEffect, useState } from 'preact/hooks';

import { SdkConfig } from '../types/QubicCreator';
import { Currency } from '../types/price';
import { getBatchBuyAssetResult } from '../api/purchase';

const IFRAME_ID = 'qubic-pay-iframe';
const IFRAME_DOMAIN = 'http://qubic-pay-sdk.surge.sh';

export interface PaymentFormProps {
  tokenId?: string;
  assetImage: string;
  assetName: string;
  assetPrice: number;
  contractId?: number;
  assetId?: number;
  assetQuantity?: number;
  assetBatchId?: number;
  currency: Currency;
  tapPayMerchantId: string;

  stop3DValidation?: boolean;
}

export function createPaymentFormElement(
  sdkConfig: SdkConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const { key: apiKey, secret: apiSecret } = sdkConfig;

  const PaymentForm = memo(
    ({
      getFormProps,
      onSuccessCallback,
    }: {
      getFormProps: () => PaymentFormProps;
      onSuccessCallback: (result: any) => void;
    }) => {
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
        tapPayMerchantId,
        stop3DValidation,
      } = getFormProps() || {};

      const [iframeLoaded, setIframeLoaded] = useState(false);

      const iframeOnLoad = useCallback(() => {
        setIframeLoaded(true);
      }, []);

      useEffect(() => {
        async function onMessageHandler(ev: MessageEvent) {
          if (ev.origin !== IFRAME_DOMAIN) return;
          const { data } = ev;

          try {
            const { prime, userEmail, userName, userPhone } = JSON.parse(data);

            if (prime && userEmail && userName && userPhone) {
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
                tapPayMerchantId,
                stop3DValidation,
                tapPayPrime: prime,
              });

              onSuccessCallback(response.batchBuyAsset);
            }
          } catch (e) {
            console.error(e);
          }
        }

        window.addEventListener('message', onMessageHandler);

        return () => {
          window.removeEventListener('message', onMessageHandler);
        };
      }, [
        assetBatchId,
        assetId,
        assetImage,
        assetName,
        assetPrice,
        assetQuantity,
        contractId,
        currency,
        onSuccessCallback,
        stop3DValidation,
        tapPayMerchantId,
        tokenId,
      ]);

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
        <iframe id={IFRAME_ID} title="qubic-pay" src={IFRAME_DOMAIN} width={300} height={450} onLoad={iframeOnLoad} />
      );
    },
  );

  return PaymentForm;
}
