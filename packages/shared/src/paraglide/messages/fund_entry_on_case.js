/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown> }} Fund_Entry_On_CaseInputs */

const en_fund_entry_on_case = /** @type {(inputs: Fund_Entry_On_CaseInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`on a ${i?.ticket}`)
};

const es_fund_entry_on_case = /** @type {(inputs: Fund_Entry_On_CaseInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`en un ${i?.ticket}`)
};

const en_xa2_fund_entry_on_case = /** @type {(inputs: Fund_Entry_On_CaseInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦òn à  ••${i?.ticket}⟧`)
};

/**
* | output |
* | --- |
* | "on a {ticket}" |
*
* @param {Fund_Entry_On_CaseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_entry_on_case = /** @type {((inputs: Fund_Entry_On_CaseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Entry_On_CaseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_entry_on_case(inputs)
	if (locale === "en-XA") return en_xa2_fund_entry_on_case(inputs)
	return en_fund_entry_on_case(inputs)
});