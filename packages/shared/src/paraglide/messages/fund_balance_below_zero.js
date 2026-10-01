/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Balance_Below_ZeroInputs */

const en_fund_balance_below_zero = /** @type {(inputs: Fund_Balance_Below_ZeroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Below zero`)
};

const es_fund_balance_below_zero = /** @type {(inputs: Fund_Balance_Below_ZeroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Por debajo de cero`)
};

const en_xa2_fund_balance_below_zero = /** @type {(inputs: Fund_Balance_Below_ZeroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bèlòw zèrò •••⟧`)
};

/**
* | output |
* | --- |
* | "Below zero" |
*
* @param {Fund_Balance_Below_ZeroInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_balance_below_zero = /** @type {((inputs?: Fund_Balance_Below_ZeroInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Balance_Below_ZeroInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_balance_below_zero(inputs)
	if (locale === "en-XA") return en_xa2_fund_balance_below_zero(inputs)
	return en_fund_balance_below_zero(inputs)
});