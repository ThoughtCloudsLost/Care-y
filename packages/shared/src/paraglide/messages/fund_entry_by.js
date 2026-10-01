/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Fund_Entry_ByInputs */

const en_fund_entry_by = /** @type {(inputs: Fund_Entry_ByInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Recorded by ${i?.name}`)
};

const es_fund_entry_by = /** @type {(inputs: Fund_Entry_ByInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Registrado por ${i?.name}`)
};

const en_xa2_fund_entry_by = /** @type {(inputs: Fund_Entry_ByInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Rècòrdèd by  ••••${i?.name}⟧`)
};

/**
* | output |
* | --- |
* | "Recorded by {name}" |
*
* @param {Fund_Entry_ByInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_entry_by = /** @type {((inputs: Fund_Entry_ByInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Entry_ByInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_entry_by(inputs)
	if (locale === "en-XA") return en_xa2_fund_entry_by(inputs)
	return en_fund_entry_by(inputs)
});