/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Search_HeadingInputs */

const en_demo_entry_search_heading = /** @type {(inputs: Demo_Entry_Search_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search`)
};

const es_demo_entry_search_heading = /** @type {(inputs: Demo_Entry_Search_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Búsqueda`)
};

/**
* | output |
* | --- |
* | "Search" |
*
* @param {Demo_Entry_Search_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_search_heading = /** @type {((inputs?: Demo_Entry_Search_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Search_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_entry_search_heading(inputs)
	return en_demo_entry_search_heading(inputs)
});