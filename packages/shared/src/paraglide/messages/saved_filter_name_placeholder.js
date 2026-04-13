/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_Name_PlaceholderInputs */

const en_saved_filter_name_placeholder = /** @type {(inputs: Saved_Filter_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`e.g. Urgent Housing`)
};

const es_saved_filter_name_placeholder = /** @type {(inputs: Saved_Filter_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ej. Vivienda urgente`)
};

/**
* | output |
* | --- |
* | "e.g. Urgent Housing" |
*
* @param {Saved_Filter_Name_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const saved_filter_name_placeholder = /** @type {((inputs?: Saved_Filter_Name_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_Name_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_saved_filter_name_placeholder(inputs)
	return es_saved_filter_name_placeholder(inputs)
});