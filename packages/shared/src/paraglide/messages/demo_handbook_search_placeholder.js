/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Handbook_Search_PlaceholderInputs */

const en_demo_handbook_search_placeholder = /** @type {(inputs: Demo_Handbook_Search_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search handbook...`)
};

const es_demo_handbook_search_placeholder = /** @type {(inputs: Demo_Handbook_Search_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar en el manual...`)
};

const en_xa2_demo_handbook_search_placeholder = /** @type {(inputs: Demo_Handbook_Search_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèàrch hàndbòòk... ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Search handbook..." |
*
* @param {Demo_Handbook_Search_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_handbook_search_placeholder = /** @type {((inputs?: Demo_Handbook_Search_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Handbook_Search_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_handbook_search_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_demo_handbook_search_placeholder(inputs)
	return en_demo_handbook_search_placeholder(inputs)
});