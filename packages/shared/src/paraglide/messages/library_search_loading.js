/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Search_LoadingInputs */

const en_library_search_loading = /** @type {(inputs: Library_Search_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Loading search index...`)
};

const es_library_search_loading = /** @type {(inputs: Library_Search_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargando índice de búsqueda...`)
};

/**
* | output |
* | --- |
* | "Loading search index..." |
*
* @param {Library_Search_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_search_loading = /** @type {((inputs?: Library_Search_LoadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Search_LoadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_search_loading(inputs)
	return es_library_search_loading(inputs)
});