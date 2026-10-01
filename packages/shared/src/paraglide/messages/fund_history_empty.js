/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_History_EmptyInputs */

const en_fund_history_empty = /** @type {(inputs: Fund_History_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nothing recorded yet.`)
};

const es_fund_history_empty = /** @type {(inputs: Fund_History_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todavía no hay nada registrado.`)
};

const en_xa2_fund_history_empty = /** @type {(inputs: Fund_History_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòthìng rècòrdèd yèt. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Nothing recorded yet." |
*
* @param {Fund_History_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_history_empty = /** @type {((inputs?: Fund_History_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_History_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_history_empty(inputs)
	if (locale === "en-XA") return en_xa2_fund_history_empty(inputs)
	return en_fund_history_empty(inputs)
});