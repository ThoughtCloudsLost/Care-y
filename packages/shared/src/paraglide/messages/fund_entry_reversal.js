/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Entry_ReversalInputs */

const en_fund_entry_reversal = /** @type {(inputs: Fund_Entry_ReversalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correction`)
};

const es_fund_entry_reversal = /** @type {(inputs: Fund_Entry_ReversalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Corrección`)
};

const en_xa2_fund_entry_reversal = /** @type {(inputs: Fund_Entry_ReversalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còrrèctìòn •••⟧`)
};

/**
* | output |
* | --- |
* | "Correction" |
*
* @param {Fund_Entry_ReversalInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_entry_reversal = /** @type {((inputs?: Fund_Entry_ReversalInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Entry_ReversalInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_entry_reversal(inputs)
	if (locale === "en-XA") return en_xa2_fund_entry_reversal(inputs)
	return en_fund_entry_reversal(inputs)
});