/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ found: NonNullable<unknown>, total: NonNullable<unknown> }} Search_Full_SummaryInputs */

const en_search_full_summary = /** @type {(inputs: Search_Full_SummaryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Found ${i?.found} results across ${i?.total} items`)
};

const es_search_full_summary = /** @type {(inputs: Search_Full_SummaryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Se encontraron ${i?.found} resultados en ${i?.total} elementos`)
};

/**
* | output |
* | --- |
* | "Found {found} results across {total} items" |
*
* @param {Search_Full_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_full_summary = /** @type {((inputs: Search_Full_SummaryInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Full_SummaryInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_full_summary(inputs)
	return es_search_full_summary(inputs)
});