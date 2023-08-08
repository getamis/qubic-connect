import { gql } from 'graphql-request';
import { SdkRequestGraphql } from '../utils/graphql';

export interface ClientTicketIssueResponse {
  clientTicketIssue: {
    ticket: string;
    expiredAt: number;
  };
}

export const CLIENT_TICKET_ISSUE = gql`
  mutation ClientTicketIssue {
    clientTicketIssue {
      ticket
      expiredAt
    }
  }
`;

export async function clientTicketIssue(sdkRequestGraphql: SdkRequestGraphql): Promise<ClientTicketIssueResponse> {
  const response = await sdkRequestGraphql<ClientTicketIssueResponse>({
    query: CLIENT_TICKET_ISSUE,
    path: '/services/graphql-public',
  });

  return response;
}
