/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Back_To_LibraryInputs */

const en_library_back_to_library = /** @type {(inputs: Library_Back_To_LibraryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Back to Library`)
};

const es_library_back_to_library = /** @type {(inputs: Library_Back_To_LibraryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volver a Biblioteca`)
};

/**
* | output |
* | --- |
* | "Back to Library" |
*
* @param {Library_Back_To_LibraryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_back_to_library = /** @type {((inputs?: Library_Back_To_LibraryInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Back_To_LibraryInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_back_to_library(inputs)
	return es_library_back_to_library(inputs)
});