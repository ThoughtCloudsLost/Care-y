/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Recents_HeadingInputs */

const en_search_recents_heading = /** @type {(inputs: Search_Recents_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recent`)
};

const es_search_recents_heading = /** @type {(inputs: Search_Recents_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recientes`)
};

/**
* | output |
* | --- |
* | "Recent" |
*
* @param {Search_Recents_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_recents_heading = /** @type {((inputs?: Search_Recents_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Recents_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_recents_heading(inputs)
	return es_search_recents_heading(inputs)
});