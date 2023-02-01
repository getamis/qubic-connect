import { Client } from 'graphql-ws';
import {
  IdentityError,
  IdentityTicket,
  IdentityTicketSubscribe,
  IdentityTicketVerification,
} from '../types/IdentityTicketSubscribe';

export function subscribeIdentityTicket(
  client: Client,
  callbacks: {
    onIdentityTicketVerification: (identityTicketVerification: IdentityTicketVerification) => void;
    onIdentityTicket: (identityTicket: IdentityTicket) => void;
    onError: (error: IdentityError | unknown) => void;
    onComplete: () => void;
  },
): void {
  client.subscribe<{
    identityTicketSubscribe: IdentityTicketSubscribe;
  }>(
    {
      query: `
        subscription IdentityTicketSubscribe {
          identityTicketSubscribe {
            identityTicketVerification {
              requestId
              passCode
              expiredAt
            }
            identityTicket {
              userAddress
              ticket
              expiredAt
            }
            error {
              code
              subCode
              message
            }
          }
        }
      `,
    },
    {
      next: result => {
        if (!result.data) return;
        const { identityTicketVerification, identityTicket, error } = result.data.identityTicketSubscribe;
        if (error) {
          callbacks.onError(error);
          return;
        }

        if (identityTicketVerification) {
          callbacks.onIdentityTicketVerification(identityTicketVerification);
          return;
        }

        if (identityTicket) {
          callbacks.onIdentityTicket(identityTicket);
        }
      },
      error: error => {
        callbacks.onError(error);
      },
      complete: () => {
        callbacks.onComplete();
      },
    },
  );
}
