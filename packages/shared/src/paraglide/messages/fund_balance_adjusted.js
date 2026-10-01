/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Balance_AdjustedInputs */

const en_fund_balance_adjusted = /** @type {(inputs: Fund_Balance_AdjustedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Adjusted`)
};

const es_fund_balance_adjusted = /** @type {(inputs: Fund_Balance_AdjustedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ajustado`)
};

const en_xa2_fund_balance_adjusted = /** @type {(inputs: Fund_Balance_AdjustedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdjùstèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Adjusted" |
*
* @param {Fund_Balance_AdjustedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_balance_adjusted = /** @type {((inputs?: Fund_Balance_AdjustedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Balance_AdjustedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_balance_adjusted(inputs)
	if (locale === "en-XA") return en_xa2_fund_balance_adjusted(inputs)
	return en_fund_balance_adjusted(inputs)
});