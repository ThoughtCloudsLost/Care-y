/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_File_Too_LargeInputs */

const en_library_file_too_large = /** @type {(inputs: Library_File_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`File must be under 10 MB`)
};

const es_library_file_too_large = /** @type {(inputs: Library_File_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El archivo debe ser menor de 10 MB`)
};

/**
* | output |
* | --- |
* | "File must be under 10 MB" |
*
* @param {Library_File_Too_LargeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_file_too_large = /** @type {((inputs?: Library_File_Too_LargeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_File_Too_LargeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_file_too_large(inputs)
	return es_library_file_too_large(inputs)
});