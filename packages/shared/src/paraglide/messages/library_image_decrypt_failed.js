/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Image_Decrypt_FailedInputs */

const en_library_image_decrypt_failed = /** @type {(inputs: Library_Image_Decrypt_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Image could not be loaded`)
};

const es_library_image_decrypt_failed = /** @type {(inputs: Library_Image_Decrypt_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo cargar la imagen`)
};

const en_xa2_library_image_decrypt_failed = /** @type {(inputs: Library_Image_Decrypt_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìmàgè còùld nòt bè lòàdèd ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Image could not be loaded" |
*
* @param {Library_Image_Decrypt_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_image_decrypt_failed = /** @type {((inputs?: Library_Image_Decrypt_FailedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Image_Decrypt_FailedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_image_decrypt_failed(inputs)
	if (locale === "en-XA") return en_xa2_library_image_decrypt_failed(inputs)
	return en_library_image_decrypt_failed(inputs)
});