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

const en_xa2_library_search_loading = /** @type {(inputs: Library_Search_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòàdìng sèàrch ìndèx... •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Loading search index..." |
*
* @param {Library_Search_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_search_loading = /** @type {((inputs?: Library_Search_LoadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Search_LoadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_search_loading(inputs)
	if (locale === "en-XA") return en_xa2_library_search_loading(inputs)
	return en_library_search_loading(inputs)
});