/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Empty_StampInputs */

const en_search_empty_stamp = /** @type {(inputs: Search_Empty_StampInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No matches`)
};

const es_search_empty_stamp = /** @type {(inputs: Search_Empty_StampInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin resultados`)
};

/**
* | output |
* | --- |
* | "No matches" |
*
* @param {Search_Empty_StampInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_empty_stamp = /** @type {((inputs?: Search_Empty_StampInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Empty_StampInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_empty_stamp(inputs)
	return es_search_empty_stamp(inputs)
});