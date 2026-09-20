/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ query: NonNullable<unknown> }} Library_Search_No_ResultsInputs */

const en_library_search_no_results = /** @type {(inputs: Library_Search_No_ResultsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No articles match "${i?.query}"`)
};

const es_library_search_no_results = /** @type {(inputs: Library_Search_No_ResultsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Ningún artículo coincide con "${i?.query}"`)
};

const en_xa2_library_search_no_results = /** @type {(inputs: Library_Search_No_ResultsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nò àrtìclès màtch " ••••••${i?.query}" •⟧`)
};

/**
* | output |
* | --- |
* | "No articles match \"{query}\"" |
*
* @param {Library_Search_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_search_no_results = /** @type {((inputs: Library_Search_No_ResultsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Search_No_ResultsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_search_no_results(inputs)
	if (locale === "en-XA") return en_xa2_library_search_no_results(inputs)
	return en_library_search_no_results(inputs)
});