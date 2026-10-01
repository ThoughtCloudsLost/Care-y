/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ amount: NonNullable<unknown> }} Fund_Available_Below_ZeroInputs */

const en_fund_available_below_zero = /** @type {(inputs: Fund_Available_Below_ZeroInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.amount} available, below zero`)
};

const es_fund_available_below_zero = /** @type {(inputs: Fund_Available_Below_ZeroInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.amount} disponibles, por debajo de cero`)
};

const en_xa2_fund_available_below_zero = /** @type {(inputs: Fund_Available_Below_ZeroInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.amount} àvàìlàblè, bèlòw zèrò •••••••⟧`)
};

/**
* | output |
* | --- |
* | "{amount} available, below zero" |
*
* @param {Fund_Available_Below_ZeroInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_available_below_zero = /** @type {((inputs: Fund_Available_Below_ZeroInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Available_Below_ZeroInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_available_below_zero(inputs)
	if (locale === "en-XA") return en_xa2_fund_available_below_zero(inputs)
	return en_fund_available_below_zero(inputs)
});