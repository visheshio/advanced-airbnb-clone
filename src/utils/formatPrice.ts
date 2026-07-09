import { CURRENCIES } from '../store/useStore';

/**
 * Convert an INR price to the target currency and format it
 * with the correct symbol and locale.
 */
export function formatPrice(
  inrAmount: number,
  currencyCode: string = 'INR'
): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];
  const converted = inrAmount * currency.rate;

  // Choose locale & fraction digits based on currency
  const isJPY = currencyCode === 'JPY';
  const isINR = currencyCode === 'INR';

  const locale = isINR ? 'en-IN' : 'en-US';
  const fractionDigits = isJPY ? 0 : converted < 10 ? 2 : 0;

  const formatted = converted.toLocaleString(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return `${currency.symbol}${formatted}`;
}
