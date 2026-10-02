/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Disbursement_Note_Type_NameInputs */

const en_fund_disbursement_note_type_name = /** @type {(inputs: Fund_Disbursement_Note_Type_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disbursement`)
};

const es_fund_disbursement_note_type_name = /** @type {(inputs: Fund_Disbursement_Note_Type_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desembolso`)
};

const en_xa2_fund_disbursement_note_type_name = /** @type {(inputs: Fund_Disbursement_Note_Type_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsbùrsèmènt ••••⟧`)
};

/**
* | output |
* | --- |
* | "Disbursement" |
*
* @param {Fund_Disbursement_Note_Type_NameInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_disbursement_note_type_name = /** @type {((inputs?: Fund_Disbursement_Note_Type_NameInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Disbursement_Note_Type_NameInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_disbursement_note_type_name(inputs)
	if (locale === "en-XA") return en_xa2_fund_disbursement_note_type_name(inputs)
	return en_fund_disbursement_note_type_name(inputs)
});