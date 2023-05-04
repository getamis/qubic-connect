import { gql } from 'graphql-request';
import { AssetBuyInfo, AssetBuyInput } from '../types/Asset';
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
  ) {
    assetBuy(input: { requestId: $requestId, asset: $asset, payCallback: $payCallback, option: $option }) {
      status
      orderId
      paymentUrl
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
