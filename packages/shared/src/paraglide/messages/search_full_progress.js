/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ searched: NonNullable<unknown>, total: NonNullable<unknown> }} Search_Full_ProgressInputs */

const en_search_full_progress = /** @type {(inputs: Search_Full_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.searched}/${i?.total}`)
};

const es_search_full_progress = /** @type {(inputs: Search_Full_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.searched}/${i?.total}`)
};

/**
* | output |
* | --- |
* | "{searched}/{total}" |
*
* @param {Search_Full_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_full_progress = /** @type {((inputs: Search_Full_ProgressInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Full_ProgressInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_full_progress(inputs)
	return es_search_full_progress(inputs)
});