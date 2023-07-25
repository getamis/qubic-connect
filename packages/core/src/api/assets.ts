import { gql } from 'graphql-request';
import { AssetBuyInfo, AssetBuyInput, GiftRedeemInfo, GiftRedeemInput } from '../types/Asset';
import { SdkRequestGraphql } from '../utils/graphql';

export interface BuyAssetResponse {
  assetBuy: AssetBuyInfo;
}

export const BUY_ASSET = gql`
  mutation BuyAsset(
    $requestId: String!
    $asset: AssetSaleInput!
    $payCallback: PayCallbackInput!
    $option: AssetBuyOptionInput
    $dryrun: Boolean!
  ) {
    assetBuy(
      input: { requestId: $requestId, asset: $asset, payCallback: $payCallback, option: $option, dryrun: $dryrun }
    ) {
      status
      orderId
      paymentUrl
      payTypes
    }
  }
`;

export async function buyAsset(
  sdkRequestGraphql: SdkRequestGraphql<AssetBuyInput, BuyAssetResponse>,
  assetBuyInput: AssetBuyInput,
): Promise<BuyAssetResponse> {
  const response = await sdkRequestGraphql({
    query: BUY_ASSET,
    variables: assetBuyInput,
  });

  return response;
}

export interface GiftRedeemResponse {
  giftRedeem: GiftRedeemInfo;
}

export const GIFT_REDEEM = gql`
  mutation GiftRedeem($requestId: String!, $giftTicket: String!, $payCallback: PayCallbackInput!) {
    giftRedeem(input: { requestId: $requestId, giftTicket: $giftTicket, payCallback: $payCallback }) {
      status
      orderId
      paymentUrl
      payTypes
    }
  }
`;

export async function giftRedeem(
  sdkRequestGraphql: SdkRequestGraphql<GiftRedeemInput, GiftRedeemResponse>,
  giftRedeemInput: GiftRedeemInput,
): Promise<GiftRedeemResponse> {
  const response = await sdkRequestGraphql({
    query: GIFT_REDEEM,
    variables: giftRedeemInput,
  });

  return response;
}
