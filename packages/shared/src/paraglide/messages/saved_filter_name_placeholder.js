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

const en_xa2_saved_filter_name_placeholder = /** @type {(inputs: Saved_Filter_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦è.g. Ùrgènt Hòùsìng ••••••⟧`)
};

/**
* | output |
* | --- |
* | "e.g. Urgent Housing" |
*
* @param {Saved_Filter_Name_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_name_placeholder = /** @type {((inputs?: Saved_Filter_Name_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_Name_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_saved_filter_name_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_saved_filter_name_placeholder(inputs)
	return en_saved_filter_name_placeholder(inputs)
});