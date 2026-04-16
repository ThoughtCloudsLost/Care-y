/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Attachment_UploadedInputs */

const en_library_attachment_uploaded = /** @type {(inputs: Library_Attachment_UploadedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Attachment uploaded`)
};

const es_library_attachment_uploaded = /** @type {(inputs: Library_Attachment_UploadedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Archivo adjunto subido`)
};

/**
* | output |
* | --- |
* | "Attachment uploaded" |
*
* @param {Library_Attachment_UploadedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_attachment_uploaded = /** @type {((inputs?: Library_Attachment_UploadedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Attachment_UploadedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_attachment_uploaded(inputs)
	return es_library_attachment_uploaded(inputs)
});