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

const en_xa2_library_image_missing_alt = /** @type {(inputs: Library_Image_Missing_AltInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mìssìng àlt tèxt •••••⟧`)
};

/**
* | output |
* | --- |
* | "Missing alt text" |
*
* @param {Library_Image_Missing_AltInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_image_missing_alt = /** @type {((inputs?: Library_Image_Missing_AltInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Image_Missing_AltInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_image_missing_alt(inputs)
	if (locale === "en-XA") return en_xa2_library_image_missing_alt(inputs)
	return en_library_image_missing_alt(inputs)
});