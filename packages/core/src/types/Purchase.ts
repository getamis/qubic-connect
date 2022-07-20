import { Currency } from './price';

export interface PaymentResult {
  tappay: {
    status: string;
    msg: string;
    paymentUrl: string;
    cardInfo: {
      lastFour: string;
    };
  };
}

export interface Order {
  tokenId?: string;
  assetImage: string;
  assetName: string;
  assetPrice: number;
  contractId?: number;
  assetId?: number;
  assetQuantity?: number;
  assetBatchId?: number;
  currency: Currency;

  stop3DValidation?: boolean;
}
