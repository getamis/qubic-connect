import { PaymentLocale } from '../types/Asset';

export function addLocaleToUrl(url: string, locale: PaymentLocale): string {
  const paymentUrlObject = new URL(url);
  const params = new URLSearchParams(paymentUrlObject.search);
  params.append('locale', locale);
  paymentUrlObject.search = params.toString();
  return paymentUrlObject.href;
}
