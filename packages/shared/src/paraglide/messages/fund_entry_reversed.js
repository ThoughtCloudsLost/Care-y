/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Entry_ReversedInputs */

const en_fund_entry_reversed = /** @type {(inputs: Fund_Entry_ReversedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Corrected`)
};

const es_fund_entry_reversed = /** @type {(inputs: Fund_Entry_ReversedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Corregido`)
};

const en_xa2_fund_entry_reversed = /** @type {(inputs: Fund_Entry_ReversedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còrrèctèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Corrected" |
*
* @param {Fund_Entry_ReversedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_entry_reversed = /** @type {((inputs?: Fund_Entry_ReversedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Entry_ReversedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_entry_reversed(inputs)
	if (locale === "en-XA") return en_xa2_fund_entry_reversed(inputs)
	return en_fund_entry_reversed(inputs)
});