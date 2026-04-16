/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_File_Type_Not_AllowedInputs */

const en_library_file_type_not_allowed = /** @type {(inputs: Library_File_Type_Not_AllowedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This file type is not supported`)
};

const es_library_file_type_not_allowed = /** @type {(inputs: Library_File_Type_Not_AllowedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este tipo de archivo no es compatible`)
};

/**
* | output |
* | --- |
* | "This file type is not supported" |
*
* @param {Library_File_Type_Not_AllowedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_file_type_not_allowed = /** @type {((inputs?: Library_File_Type_Not_AllowedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_File_Type_Not_AllowedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_file_type_not_allowed(inputs)
	return es_library_file_type_not_allowed(inputs)
});