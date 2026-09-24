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

const en_xa2_search_empty_stamp = /** @type {(inputs: Search_Empty_StampInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò màtchès •••⟧`)
};

/**
* | output |
* | --- |
* | "No matches" |
*
* @param {Search_Empty_StampInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_empty_stamp = /** @type {((inputs?: Search_Empty_StampInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Empty_StampInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_empty_stamp(inputs)
	if (locale === "en-XA") return en_xa2_search_empty_stamp(inputs)
	return en_search_empty_stamp(inputs)
});