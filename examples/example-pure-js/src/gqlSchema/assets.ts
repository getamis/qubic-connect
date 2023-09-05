import { gql } from 'graphql-request';

export const GET_ASSET_DETAIL = gql`
  query getAsset($assetId: ID!, $privateSaleCode: String) {
    asset(assetId: $assetId) {
      id
      metadata {
        id
        name
        imageThumbnailUrl
      }
      saleData {
        id
        gift {
          expiresDays
        }
        salePhases {
          mode
        }
        variants(privateSaleCode: $privateSaleCode) {
          id
          available
          supply
          maxQuantity
          price
          saleState
        }
      }
    }
  }
`;

export interface AssetVariant {
  id: string;
  available: number;
  supply: number;
  maxQuantity: number;
  price: string;
  traits: string[];
  saleState: string;
}

export interface AssetDetail {
  id: string;
  metadata: {
    id: string;
    name: string;
    imageThumbnailUrl: string;
  };
  saleData: {
    id: string;
    gift: {
      expiredDays: string;
    } | null;
    salePhases: {
      mode: string;
    };
    variants: Array<AssetVariant>;
  };
}
