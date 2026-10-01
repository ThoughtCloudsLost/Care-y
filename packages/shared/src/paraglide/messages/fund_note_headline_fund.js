/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ amount: NonNullable<unknown>, fund: NonNullable<unknown> }} Fund_Note_Headline_FundInputs */

const en_fund_note_headline_fund = /** @type {(inputs: Fund_Note_Headline_FundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Disbursed ${i?.amount} from ${i?.fund}`)
};

const es_fund_note_headline_fund = /** @type {(inputs: Fund_Note_Headline_FundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Desembolso de ${i?.amount} del fondo ${i?.fund}`)
};

const en_xa2_fund_note_headline_fund = /** @type {(inputs: Fund_Note_Headline_FundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Dìsbùrsèd  •••${i?.amount} fròm  ••${i?.fund}⟧`)
};

/**
* | output |
* | --- |
* | "Disbursed {amount} from {fund}" |
*
* @param {Fund_Note_Headline_FundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_note_headline_fund = /** @type {((inputs: Fund_Note_Headline_FundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Note_Headline_FundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_note_headline_fund(inputs)
	if (locale === "en-XA") return en_xa2_fund_note_headline_fund(inputs)
	return en_fund_note_headline_fund(inputs)
});