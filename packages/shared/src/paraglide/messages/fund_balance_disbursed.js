/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Balance_DisbursedInputs */

const en_fund_balance_disbursed = /** @type {(inputs: Fund_Balance_DisbursedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disbursed`)
};

const es_fund_balance_disbursed = /** @type {(inputs: Fund_Balance_DisbursedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desembolsado`)
};

const en_xa2_fund_balance_disbursed = /** @type {(inputs: Fund_Balance_DisbursedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsbùrsèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Disbursed" |
*
* @param {Fund_Balance_DisbursedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_balance_disbursed = /** @type {((inputs?: Fund_Balance_DisbursedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Balance_DisbursedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_balance_disbursed(inputs)
	if (locale === "en-XA") return en_xa2_fund_balance_disbursed(inputs)
	return en_fund_balance_disbursed(inputs)
});