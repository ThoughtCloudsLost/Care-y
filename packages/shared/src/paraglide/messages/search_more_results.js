/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Search_More_ResultsInputs */

const en_search_more_results = /** @type {(inputs: Search_More_ResultsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} more`)
};

const es_search_more_results = /** @type {(inputs: Search_More_ResultsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} más`)
};

const en_xa2_search_more_results = /** @type {(inputs: Search_More_ResultsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} mòrè ••⟧`)
};

/**
* | output |
* | --- |
* | "{count} more" |
*
* @param {Search_More_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_more_results = /** @type {((inputs: Search_More_ResultsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_More_ResultsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_more_results(inputs)
	if (locale === "en-XA") return en_xa2_search_more_results(inputs)
	return en_search_more_results(inputs)
});