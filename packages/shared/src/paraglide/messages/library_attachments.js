/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_AttachmentsInputs */

const en_library_attachments = /** @type {(inputs: Library_AttachmentsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Attachments`)
};

const es_library_attachments = /** @type {(inputs: Library_AttachmentsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Archivos adjuntos`)
};

/**
* | output |
* | --- |
* | "Attachments" |
*
* @param {Library_AttachmentsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_attachments = /** @type {((inputs?: Library_AttachmentsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_AttachmentsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_attachments(inputs)
	return es_library_attachments(inputs)
});