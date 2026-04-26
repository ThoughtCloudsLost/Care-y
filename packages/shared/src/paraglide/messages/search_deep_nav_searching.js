/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ searched: NonNullable<unknown>, total: NonNullable<unknown> }} Search_Deep_Nav_SearchingInputs */

const en_search_deep_nav_searching = /** @type {(inputs: Search_Deep_Nav_SearchingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.searched}/${i?.total}`)
};

const es_search_deep_nav_searching = /** @type {(inputs: Search_Deep_Nav_SearchingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.searched}/${i?.total}`)
};

/**
* | output |
* | --- |
* | "{searched}/{total}" |
*
* @param {Search_Deep_Nav_SearchingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_deep_nav_searching = /** @type {((inputs: Search_Deep_Nav_SearchingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Deep_Nav_SearchingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_deep_nav_searching(inputs)
	return es_search_deep_nav_searching(inputs)
});