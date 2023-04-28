export enum BuyStatus {
  SUCCESS = 'SUCCESS',
  WAIT_PAYMENT = 'WAIT_PAYMENT',
  FAILED = 'FAILED',
}

export interface AssetBuyInfo {
  status: BuyStatus;
  orderId: string;
  paymentUrl: string;
}

export enum CurrencyForAsset {
  ETH = 'ETH',
  TWD = 'TWD',
  MATIC = 'MATIC',
}

export interface AssetSaleInput {
  assetId: string;
  variantId: string;
  quantity: number;
  price: number;
  currency: CurrencyForAsset;
}

export interface PayCallbackInput {
  successRedirectUrl: string;
  failureRedirectUrl: string;
  pendingRedirectUrl: string;
}

export interface AssetBuyInput {
  requestId: string;
  asset: AssetSaleInput;
  payCallback: PayCallbackInput;
}
