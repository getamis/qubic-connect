export enum PaymentErrorCode {
  // InvalidIdNumber: checkoutId format error
  InvalidIdNumber = 1116,
  // CheckoutNotFound: checkoutId not found (could be expired or not exist)
  CheckoutNotFound = 2042,
  // CheckoutPaid: checkoutId already paid
  CheckoutPaid = 2043,
  // UnsupportedPayType: payType isn't supported by this checkout
  UnsupportedPayType = 1236,
  // InvalidCurrency: currency isn't supported by this checkout
  InvalidCurrency = 1084,
  // InconsistentAmount: amount isn't consistent with the original amount
  InconsistentAmount = 1093,
  // Internal server error: unknown error
  InternalServerError = 9000,
}
