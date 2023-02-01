export interface IdentityTicketVerification {
  requestId: string;
  passCode: string;
  expiredAt: string;
}

export interface IdentityTicket {
  userAddress: string;
  ticket: string;
  expiredAt: string;
}

export interface IdentityError {
  code: string;
  subCode: string;
  message: string;
}

export interface IdentityTicketSubscribe {
  identityTicketVerification: IdentityTicketVerification | null;
  identityTicket: IdentityTicket | null;
  error: IdentityError | null;
}
