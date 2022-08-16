import { gql } from 'graphql-request';
import { deserializedPriceByCurrency, exchangeCurrency } from '../utils/price';
import { Currency } from '../types/price';
import { SdkRequestGraphql } from '../utils/graphql';

export interface PriceRequest {
  fromCurrency: Currency;
  toCurrency: Currency;
}

export interface PriceResponse {
  fromCurrency: Currency;
  toCurrency: Currency;
  toCurrencyPrecision: number;
  exchangeRate: string;
  expiredAt: number;
  signature: string;
}

export const PRICE = gql`
  query PRICE_PUBLIC($fromCurrency: Currency!, $toCurrency: Currency!) {
    price(input: { fromCurrency: $fromCurrency, toCurrency: $toCurrency }) {
      fromCurrency
      toCurrency
      toCurrencyPrecision
      exchangeRate
      expiredAt
      signature
    }
  }
`;
// ` as unknown as DocumentNode;

interface GetPriceInput {
  value: number;
}

export async function getPrice(sdkRequestGraphql: SdkRequestGraphql, { value }: GetPriceInput): Promise<string> {
  // const fiatCurrencyRate = await sdkRequestGraphql({
  //   query: PRICE,
  //   variables: {
  //     fromCurrency: Currency.TWD,
  //     toCurrency: Currency.USDC,
  //   },
  // });

  // const TWDToETHCurrencyData = await sdkRequestGraphql({
  //   query: PRICE,
  //   variables: {
  //     fromCurrency: Currency.TWD,
  //     toCurrency: Currency.ETH,
  //   },
  // });

  const ETHToTWDCurrencyData = await sdkRequestGraphql({
    query: PRICE,
    variables: {
      fromCurrency: Currency.ETH,
      toCurrency: Currency.TWD,
    },
  });

  const { exchangeRate: ETHToTWDCryptoRate, toCurrencyPrecision: ETHToTWDToCurrencyPrecision } =
    ETHToTWDCurrencyData?.price || {};

  const refinedETHToTWDCryptoRate =
    ETHToTWDCryptoRate && !Number.isNaN(parseFloat(ETHToTWDCryptoRate)) ? parseFloat(ETHToTWDCryptoRate) : 0.0;
  const refinedETHToTWDPrecision = ETHToTWDToCurrencyPrecision || 0;

  const val = deserializedPriceByCurrency({ price: value, currency: Currency.ETH });

  return exchangeCurrency(val, refinedETHToTWDCryptoRate, refinedETHToTWDPrecision);
}

interface EthToTWDExchangeInput {
  value: number;
}

export async function ethToTWDExchange(
  sdkRequestGraphql: SdkRequestGraphql,
  { value }: EthToTWDExchangeInput,
): Promise<string> {
  const ETHToTWDCurrencyData = await sdkRequestGraphql({
    query: PRICE,
    variables: {
      fromCurrency: Currency.ETH,
      toCurrency: Currency.TWD,
    },
  });

  const { exchangeRate: ETHToTWDCryptoRate, toCurrencyPrecision: ETHToTWDToCurrencyPrecision } =
    ETHToTWDCurrencyData?.price || {};

  const refinedETHToTWDCryptoRate =
    ETHToTWDCryptoRate && !Number.isNaN(parseFloat(ETHToTWDCryptoRate)) ? parseFloat(ETHToTWDCryptoRate) : 0.0;
  const refinedETHToTWDPrecision = ETHToTWDToCurrencyPrecision || 0;

  const val = deserializedPriceByCurrency({ price: value, currency: Currency.ETH });

  return exchangeCurrency(val, refinedETHToTWDCryptoRate, refinedETHToTWDPrecision);
}
