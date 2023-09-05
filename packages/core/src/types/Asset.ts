export enum BuyStatus {
  SUCCESS = 'SUCCESS',
  WAIT_PAYMENT = 'WAIT_PAYMENT',
  FAILED = 'FAILED',
}

enum CheckoutPaymentType {
  UNSELECTED = 'UNSELECTED',
  FREE = 'FREE',
  CREDIT_CARD = 'CREDIT_CARD',
  TRANSFER = 'TRANSFER',
  CRYPTO = 'CRYPTO',
}

enum UnavailablePaymentReason {
  GAS_PRICE_SURGE = 'GAS_PRICE_SURGE',
  PAYMENT_LIMIT_EXCEEDED = 'PAYMENT_LIMIT_EXCEEDED',
  EXCHANGE_PRICE_FAILED = 'EXCHANGE_PRICE_FAILED',
  PAYMENT_MAINTENANCE = 'PAYMENT_MAINTENANCE',
}

export interface UnavailablePayment {
  type: CheckoutPaymentType;
  reason: UnavailablePaymentReason;
}

export interface AssetBuyInfo {
  status: BuyStatus;
  orderId: string;
  paymentUrl: string;
  paymentTypes: CheckoutPaymentType[];
  unavailablePayments: UnavailablePayment[];
}

export enum CurrencyForAsset {
  ETH = 'ETH',
  TWD = 'TWD',
  MATIC = 'MATIC',
}

export interface AssetSaleInput {
  assetVariantId: string;
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
  privateSaleCode?: string;
}

export interface AssetBuyInput {
  requestId: string;
  asset: AssetSaleInput;
  payCallback: PayCallbackInput;
  test?: boolean;
  option?: AssetBuyOptionInput;
}

export type PaymentLocale = 'en' | 'zh';

export interface AssetBuyOptions {
  locale?: PaymentLocale;
}

export interface GiftRedeemInput {
  requestId: string;
  // valid giftCode should be `^[A-HJ-NP-Z]{8}$`
  giftCode: string;
  payCallback: PayCallbackInput;
}

export type GiftRedeemInfo = AssetBuyInfo;
export type GiftRedeemOptions = AssetBuyOptions;
