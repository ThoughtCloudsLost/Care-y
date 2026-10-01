/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ currency: NonNullable<unknown> }} Fund_Amount_Currency_HintInputs */

const en_fund_amount_currency_hint = /** @type {(inputs: Fund_Amount_Currency_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`In ${i?.currency}, up to two decimals.`)
};

const es_fund_amount_currency_hint = /** @type {(inputs: Fund_Amount_Currency_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`En ${i?.currency}, con dos decimales como máximo.`)
};

const en_xa2_fund_amount_currency_hint = /** @type {(inputs: Fund_Amount_Currency_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Ìn  •${i?.currency}, ùp tò twò dècìmàls. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "In {currency}, up to two decimals." |
*
* @param {Fund_Amount_Currency_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_amount_currency_hint = /** @type {((inputs: Fund_Amount_Currency_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Amount_Currency_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_amount_currency_hint(inputs)
	if (locale === "en-XA") return en_xa2_fund_amount_currency_hint(inputs)
	return en_fund_amount_currency_hint(inputs)
});