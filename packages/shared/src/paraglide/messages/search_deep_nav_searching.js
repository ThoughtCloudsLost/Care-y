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

const en_xa2_search_deep_nav_searching = /** @type {(inputs: Search_Deep_Nav_SearchingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.searched}/ •${i?.total}⟧`)
};

/**
* | output |
* | --- |
* | "{searched}/{total}" |
*
* @param {Search_Deep_Nav_SearchingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_deep_nav_searching = /** @type {((inputs: Search_Deep_Nav_SearchingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Deep_Nav_SearchingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_deep_nav_searching(inputs)
	if (locale === "en-XA") return en_xa2_search_deep_nav_searching(inputs)
	return en_search_deep_nav_searching(inputs)
});