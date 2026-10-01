/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ amount: NonNullable<unknown> }} Fund_Note_HeadlineInputs */

const en_fund_note_headline = /** @type {(inputs: Fund_Note_HeadlineInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Disbursed ${i?.amount}`)
};

const es_fund_note_headline = /** @type {(inputs: Fund_Note_HeadlineInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Desembolso de ${i?.amount}`)
};

const en_xa2_fund_note_headline = /** @type {(inputs: Fund_Note_HeadlineInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Dìsbùrsèd  •••${i?.amount}⟧`)
};

/**
* | output |
* | --- |
* | "Disbursed {amount}" |
*
* @param {Fund_Note_HeadlineInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_note_headline = /** @type {((inputs: Fund_Note_HeadlineInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Note_HeadlineInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_note_headline(inputs)
	if (locale === "en-XA") return en_xa2_fund_note_headline(inputs)
	return en_fund_note_headline(inputs)
});