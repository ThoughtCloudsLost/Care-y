/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Balance_RaisedInputs */

const en_fund_balance_raised = /** @type {(inputs: Fund_Balance_RaisedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Raised`)
};

const es_fund_balance_raised = /** @type {(inputs: Fund_Balance_RaisedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recaudado`)
};

const en_xa2_fund_balance_raised = /** @type {(inputs: Fund_Balance_RaisedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ràìsèd ••⟧`)
};

/**
* | output |
* | --- |
* | "Raised" |
*
* @param {Fund_Balance_RaisedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_balance_raised = /** @type {((inputs?: Fund_Balance_RaisedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Balance_RaisedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_balance_raised(inputs)
	if (locale === "en-XA") return en_xa2_fund_balance_raised(inputs)
	return en_fund_balance_raised(inputs)
});