/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_LoadingInputs */

const en_library_loading = /** @type {(inputs: Library_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Loading articles...`)
};

const es_library_loading = /** @type {(inputs: Library_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargando artículos...`)
};

/**
* | output |
* | --- |
* | "Loading articles..." |
*
* @param {Library_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_loading = /** @type {((inputs?: Library_LoadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_LoadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_loading(inputs)
	return es_library_loading(inputs)
});