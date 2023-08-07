import { gql } from 'graphql-request';
import { QubicUser } from '../types/QubicUser';
import { SdkRequestGraphql } from '../utils/graphql';

export interface MeResponse {
  me: {
    address: string;
    qubicUser: QubicUser | null;
  };
}

export const GET_ME = gql`
  query GetMe {
    me {
      address
      qubicUser {
        provider
        email
      }
    }
  }
`;

export async function getMe(sdkRequestGraphql: SdkRequestGraphql): Promise<MeResponse> {
  const meResponse = await sdkRequestGraphql<MeResponse>({
    query: GET_ME,
  });

  return meResponse;
}
