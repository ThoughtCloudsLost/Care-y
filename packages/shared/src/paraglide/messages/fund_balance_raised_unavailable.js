/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Balance_Raised_UnavailableInputs */

const en_fund_balance_raised_unavailable = /** @type {(inputs: Fund_Balance_Raised_UnavailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Raised total unavailable`)
};

const es_fund_balance_raised_unavailable = /** @type {(inputs: Fund_Balance_Raised_UnavailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Total recaudado no disponible`)
};

const en_xa2_fund_balance_raised_unavailable = /** @type {(inputs: Fund_Balance_Raised_UnavailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ràìsèd tòtàl ùnàvàìlàblè ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Raised total unavailable" |
*
* @param {Fund_Balance_Raised_UnavailableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_balance_raised_unavailable = /** @type {((inputs?: Fund_Balance_Raised_UnavailableInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Balance_Raised_UnavailableInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_balance_raised_unavailable(inputs)
	if (locale === "en-XA") return en_xa2_fund_balance_raised_unavailable(inputs)
	return en_fund_balance_raised_unavailable(inputs)
});