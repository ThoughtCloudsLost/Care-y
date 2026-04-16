/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Image_Missing_AltInputs */

const en_library_image_missing_alt = /** @type {(inputs: Library_Image_Missing_AltInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Missing alt text`)
};

const es_library_image_missing_alt = /** @type {(inputs: Library_Image_Missing_AltInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Falta texto alternativo`)
};

/**
* | output |
* | --- |
* | "Missing alt text" |
*
* @param {Library_Image_Missing_AltInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_image_missing_alt = /** @type {((inputs?: Library_Image_Missing_AltInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Image_Missing_AltInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_image_missing_alt(inputs)
	return es_library_image_missing_alt(inputs)
});