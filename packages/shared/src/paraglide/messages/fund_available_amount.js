/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ amount: NonNullable<unknown> }} Fund_Available_AmountInputs */

const en_fund_available_amount = /** @type {(inputs: Fund_Available_AmountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.amount} available`)
};

const es_fund_available_amount = /** @type {(inputs: Fund_Available_AmountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.amount} disponibles`)
};

const en_xa2_fund_available_amount = /** @type {(inputs: Fund_Available_AmountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.amount} àvàìlàblè •••⟧`)
};

/**
* | output |
* | --- |
* | "{amount} available" |
*
* @param {Fund_Available_AmountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_available_amount = /** @type {((inputs: Fund_Available_AmountInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Available_AmountInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_available_amount(inputs)
	if (locale === "en-XA") return en_xa2_fund_available_amount(inputs)
	return en_fund_available_amount(inputs)
});