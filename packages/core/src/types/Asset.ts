export enum BuyStatus {
  SUCCESS = 'SUCCESS',
  WAIT_PAYMENT = 'WAIT_PAYMENT',
  FAILED = 'FAILED',
}

enum CheckoutPayType {
  TAPPAY_CREDIT_CARD = 'TAPPAY_CREDIT_CARD',
  CRYPTO = 'CRYPTO',
  NEWEBPAY_VIRTUAL_ACCOUNT = 'NEWEBPAY_VIRTUAL_ACCOUNT',
  NO_PAY = 'NO_PAY',
}

export interface AssetBuyInfo {
  status: BuyStatus;
  orderId: string;
  paymentUrl: string;
  payTypes: CheckoutPayType[];
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
  price: string;
  currency: CurrencyForAsset;
}

export interface PayCallbackInput {
  successRedirectUrl: string;
  failureRedirectUrl: string;
  pendingRedirectUrl: string;
}

export interface AssetBuyOptionInput {
  beGift?: boolean;
  purchaseCode?: string;
}

export interface AssetBuyInput {
  requestId: string;
  asset: AssetSaleInput;
  payCallback: PayCallbackInput;
  dryrun?: boolean;
  option?: AssetBuyOptionInput;
}

export type PaymentLocale = 'en' | 'zh';

export interface AssetBuyOptions {
  locale?: PaymentLocale;
}

export interface GiftRedeemInput {
  requestId: string;
  // valid giftTicket should be `^[A-HJ-NP-Z]{8}$`
  giftTicket: string;
  payCallback: PayCallbackInput;
}

export type GiftRedeemInfo = AssetBuyInfo;
export type GiftRedeemOptions = AssetBuyOptions;
