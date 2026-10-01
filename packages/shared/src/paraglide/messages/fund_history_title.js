/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ fund: NonNullable<unknown> }} Fund_History_TitleInputs */

const en_fund_history_title = /** @type {(inputs: Fund_History_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.fund} history`)
};

const es_fund_history_title = /** @type {(inputs: Fund_History_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Historial de ${i?.fund}`)
};

const en_xa2_fund_history_title = /** @type {(inputs: Fund_History_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.fund} hìstòry •••⟧`)
};

/**
* | output |
* | --- |
* | "{fund} history" |
*
* @param {Fund_History_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_history_title = /** @type {((inputs: Fund_History_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_History_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_history_title(inputs)
	if (locale === "en-XA") return en_xa2_fund_history_title(inputs)
	return en_fund_history_title(inputs)
});