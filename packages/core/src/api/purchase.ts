import { gql } from 'graphql-request';
import { v4 as uuidv4 } from 'uuid';

import { requestGraphql } from '../utils/graphql';
import { FINISH_PURCHASE_FLAG } from '../constants/tappay';
import { Currency } from '../types/price';

export enum PayType {
  TAPPAY = 'TAPPAY',
  CRYPTO = 'CRYPTO',
}

export interface Price {
  fromCurrency: Currency;
  toCurrency: Currency;
  toCurrencyPrecision: number;
  exchangeRate: string;
  expiredAt: number;
  signature: string;
}

export interface PayByPrime {
  prime: string;
  remember: boolean;
  nickName?: string;
  defaultCard?: boolean;
}

interface PayByCard {
  cardIdentifier: string;
}

interface PayOption {
  payByPrime?: PayByPrime;
  payByCard?: PayByCard;
}

export interface TappayRequest {
  amount: string;
  merchantId: string;
  currency: string;
  redirectUrl: string;
  details: string;
  productImageUrl: string;
  payOption: PayOption;
}

export const BATCH_BUY_ASSET_FIAT = gql`
  mutation BATCH_BUY_ASSET(
    $requestId: String!
    $assetId: Int!
    $quantity: Int!
    $price: Int!
    $batchId: Int
    $name: String!
    $phone: String!
    $donateInvoice: Boolean! = false
    $billingAddress: String! = ""
    $email: String!
    $note: String! = ""
    $type: PayType!
    $tappay: TappayRequest
    $currency: Currency! = TWD
    $priceRate: Price
    $cryptoPay: CryptoPayRequest
  ) {
    batchBuyAsset(
      input: {
        requestId: $requestId
        assetId: $assetId
        quantity: $quantity
        price: $price
        batchId: $batchId
        name: $name
        phone: $phone
        donateInvoice: $donateInvoice
        billingAddress: $billingAddress
        email: $email
        note: $note
        type: $type
        tappay: $tappay
        currency: $currency
        priceRate: $priceRate
        cryptoPay: $cryptoPay
      }
    ) {
      tappay {
        status
        msg
        paymentUrl
        cardInfo {
          lastFour
        }
      }
    }
  }
`;

interface BatchBuyAssetInput {
  apiKey: string;
  apiSecret: string;
  tokenId?: string;
  assetImage: string;
  assetName: string;
  assetPrice: number;
  contractId?: number;
  assetId?: number;
  assetQuantity?: number;
  assetBatchId?: number;
  currency: Currency;
  userEmail: string;
  userName: string;
  userPhone: string;
  tapPayMerchantId: string;
  stop3DValidation?: boolean;
  tapPayPrime: string;
}

export interface TappayResult {
  tappay: {
    status: string;
    msg: string;
    paymentUrl: string;
    cardInfo: {
      lastFour: string;
    };
  };
}

interface BatchBuyAssetResult {
  batchBuyAsset: TappayResult;
}

export async function getBatchBuyAssetResult({
  apiKey,
  apiSecret,
  tokenId,
  assetImage,
  assetName,
  assetPrice,
  contractId,
  assetId,
  assetQuantity = 1,
  assetBatchId,
  currency: itemCurrency = Currency.TWD,
  userEmail,
  userName,
  userPhone,
  tapPayMerchantId,
  stop3DValidation,
  tapPayPrime,
}: BatchBuyAssetInput): Promise<BatchBuyAssetResult> {
  const requestId = uuidv4();
  const buyPrice = assetPrice;
  const price = buyPrice;
  const amount = String(buyPrice * assetQuantity);
  const priceRate = undefined;
  const redirectUrl = stop3DValidation ? '' : `${window.location.href}?action=${FINISH_PURCHASE_FLAG}`;

  // tappay restrict to 100 words
  const tappayDetail =
    assetName && typeof assetName === 'string'
      ? assetName
          .replaceAll(/[<>&'"]/g, ' ')
          .slice(0, 100)
          .trim()
      : `購買 NFT: ${contractId}/${tokenId}`;

  const response = await requestGraphql({
    query: BATCH_BUY_ASSET_FIAT,
    apiKey,
    apiSecret,
    variables: {
      assetId,
      requestId,
      email: userEmail?.trim(),
      name: userName?.trim(),
      phone: userPhone?.trim(),
      // donateInvoice: isDonateInvoice,
      // billingAddress: invoiceAddress?.trim(),
      // note: getBuyNoteString(),
      type: PayType.TAPPAY,
      price, // pass the value from DB
      quantity: assetQuantity,
      batchId: assetBatchId,
      currency: itemCurrency,
      priceRate,
      tappay: {
        amount,
        merchantId: tapPayMerchantId,
        currency: Currency.TWD,
        details: tappayDetail,
        productImageUrl: assetImage,
        redirectUrl,
        payOption: {
          payByPrime: {
            prime: tapPayPrime,
            remember: false,
          },
        },
      },
    },
  });

  return response;
}
