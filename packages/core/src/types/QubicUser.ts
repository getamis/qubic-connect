export enum QubicUserProvider {
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER',
  APPLE = 'APPLE',
  UNKNOWN = 'UNKNOWN',
}

export interface QubicUser {
  provider: QubicUserProvider;
  email: string;
  phone: string | null;
}
