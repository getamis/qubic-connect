import { gql } from 'graphql-request';
import { AssetBuyInfo, AssetBuyInput, GiftRedeemInfo, GiftRedeemInput } from '../types/Asset';
import { SdkRequestGraphql } from '../utils/graphql';

export interface AssetBuyResponse {
  assetBuy: AssetBuyInfo;
}

export const BUY_ASSET = gql`
  mutation BuyAsset(
    $requestId: String!
    $asset: AssetSaleInput!
    $payCallback: PayCallbackInput!
    $option: AssetBuyOptionInput
    $test: Boolean! = false
  ) {
    assetBuy(input: { requestId: $requestId, asset: $asset, payCallback: $payCallback, option: $option, test: $test }) {
      status
      orderId
      paymentUrl
      paymentTypes
      unavailablePayments {
        type
        reason
      }
    }
  }
`;

export async function buyAsset(
  sdkRequestGraphql: SdkRequestGraphql,
  assetBuyInput: AssetBuyInput,
): Promise<AssetBuyResponse> {
  const response = await sdkRequestGraphql<AssetBuyResponse, AssetBuyInput>({
    query: BUY_ASSET,
    variables: assetBuyInput,
  });

  return response;
}

export interface GiftRedeemResponse {
  giftRedeem: GiftRedeemInfo;
}

export const GIFT_REDEEM = gql`
  mutation GiftRedeem($requestId: String!, $giftCode: String!, $payCallback: PayCallbackInput!) {
    giftRedeem(input: { requestId: $requestId, giftCode: $giftCode, payCallback: $payCallback }) {
      status
      orderId
      paymentUrl
      paymentTypes
    }
  }
`;

export async function giftRedeem(
  sdkRequestGraphql: SdkRequestGraphql,
  giftRedeemInput: GiftRedeemInput,
): Promise<GiftRedeemResponse> {
  const response = await sdkRequestGraphql({
    query: GIFT_REDEEM,
    variables: giftRedeemInput,
  });

  return response;
}
