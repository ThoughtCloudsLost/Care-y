/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ amount: NonNullable<unknown> }} Fund_Note_SummaryInputs */

const en_fund_note_summary = /** @type {(inputs: Fund_Note_SummaryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Disbursement: ${i?.amount}`)
};

const es_fund_note_summary = /** @type {(inputs: Fund_Note_SummaryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Desembolso: ${i?.amount}`)
};

const en_xa2_fund_note_summary = /** @type {(inputs: Fund_Note_SummaryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Dìsbùrsèmènt:  •••••${i?.amount}⟧`)
};

/**
* | output |
* | --- |
* | "Disbursement: {amount}" |
*
* @param {Fund_Note_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_note_summary = /** @type {((inputs: Fund_Note_SummaryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Note_SummaryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_note_summary(inputs)
	if (locale === "en-XA") return en_xa2_fund_note_summary(inputs)
	return en_fund_note_summary(inputs)
});