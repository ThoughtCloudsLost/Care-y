/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Balance_AvailableInputs */

const en_fund_balance_available = /** @type {(inputs: Fund_Balance_AvailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Available`)
};

const es_fund_balance_available = /** @type {(inputs: Fund_Balance_AvailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disponible`)
};

const en_xa2_fund_balance_available = /** @type {(inputs: Fund_Balance_AvailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àvàìlàblè •••⟧`)
};

/**
* | output |
* | --- |
* | "Available" |
*
* @param {Fund_Balance_AvailableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_balance_available = /** @type {((inputs?: Fund_Balance_AvailableInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Balance_AvailableInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_balance_available(inputs)
	if (locale === "en-XA") return en_xa2_fund_balance_available(inputs)
	return en_fund_balance_available(inputs)
});