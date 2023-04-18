import { gql } from "graphql-request"

export const LIST_ASSETS_V2 = gql`
  query LIST_ASSETS_V2(
    $first: Int!, $offset: Int!, $tags: [String!], $searchText: String, $contractIds: [Int!], $contractTypes: [ContractType!], $sort: Sort!, $disableSurge: Boolean!, $onlyAvailable: Boolean!, $paymentMode: PaymentMode
  ) {
    listAssetsV2(
      input: {first: $first, offset: $offset, tags: $tags, searchText: $searchText, contractIds: $contractIds, contractTypes: $contractTypes, sort: $sort, disableSurge: $disableSurge, onlyAvailable: $onlyAvailable, paymentMode: $paymentMode}
    ) {
      totalCount
      assets {
        assetId
        saleState
      }
    }
  }
`

export const GET_ASSET_DETAIL = gql`
  query GET_ASSET_DETAIL (
    $assetId: Int!,
    $disableSurge: Boolean!,
    $purchaseCode: String,
    $paymentMode: PaymentMode
  ) {
    getAssetDetail(input: {
      assetId: $assetId,
      disableSurge: $disableSurge,
      purchaseCode: $purchaseCode,
      paymentMode: $paymentMode,
    }) {
      batchAsset {
        maxQuantity
        available
        price
      }
      batchAssets {
        batchId
      }
    }
  }
`