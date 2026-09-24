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

const en_xa2_library_loading = /** @type {(inputs: Library_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòàdìng àrtìclès... ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Loading articles..." |
*
* @param {Library_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_loading = /** @type {((inputs?: Library_LoadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_LoadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_loading(inputs)
	if (locale === "en-XA") return en_xa2_library_loading(inputs)
	return en_library_loading(inputs)
});