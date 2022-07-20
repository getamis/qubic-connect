import BigNumber from 'bignumber.js';

import { Currency } from '../types/price';

interface CalculatePriceByCurrencyProps {
  price: number;
  currency: Currency;
}

export const deserializedPriceByCurrency = ({
  price,
  currency = Currency.TWD,
}: CalculatePriceByCurrencyProps): number => {
  if (Number.isNaN(price)) {
    return 0;
  }

  if (currency === Currency.ETH) {
    return Number((price / 1e6).toFixed(6));
  }

  return price;
};

export const exchangeCurrency = (value: number, rate?: number, precision?: number): string => {
  if (!value) return '0';
  if (!rate) return value.toLocaleString('en-US');
  if (Number.isNaN(Number(value))) return '0';

  const valueBN = new BigNumber(value);
  const rateBN = new BigNumber(rate);
  const exchangedValue = valueBN.multipliedBy(rateBN);

  return typeof precision !== 'undefined' && precision >= 0
    ? exchangedValue.decimalPlaces(precision, BigNumber.ROUND_CEIL).toNumber().toLocaleString('en-US')
    : exchangedValue.toNumber().toLocaleString('en-US');
};
