/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Image_UploadingInputs */

const en_library_image_uploading = /** @type {(inputs: Library_Image_UploadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Uploading image...`)
};

const es_library_image_uploading = /** @type {(inputs: Library_Image_UploadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Subiendo imagen...`)
};

/**
* | output |
* | --- |
* | "Uploading image..." |
*
* @param {Library_Image_UploadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_image_uploading = /** @type {((inputs?: Library_Image_UploadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Image_UploadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_image_uploading(inputs)
	return es_library_image_uploading(inputs)
});