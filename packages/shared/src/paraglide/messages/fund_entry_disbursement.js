/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Entry_DisbursementInputs */

const en_fund_entry_disbursement = /** @type {(inputs: Fund_Entry_DisbursementInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disbursement`)
};

const es_fund_entry_disbursement = /** @type {(inputs: Fund_Entry_DisbursementInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desembolso`)
};

const en_xa2_fund_entry_disbursement = /** @type {(inputs: Fund_Entry_DisbursementInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsbùrsèmènt ••••⟧`)
};

/**
* | output |
* | --- |
* | "Disbursement" |
*
* @param {Fund_Entry_DisbursementInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_entry_disbursement = /** @type {((inputs?: Fund_Entry_DisbursementInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Entry_DisbursementInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_entry_disbursement(inputs)
	if (locale === "en-XA") return en_xa2_fund_entry_disbursement(inputs)
	return en_fund_entry_disbursement(inputs)
});