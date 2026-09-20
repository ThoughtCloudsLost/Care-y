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

const en_xa2_library_attachments = /** @type {(inputs: Library_AttachmentsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àttàchmènts ••••⟧`)
};

/**
* | output |
* | --- |
* | "Attachments" |
*
* @param {Library_AttachmentsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_attachments = /** @type {((inputs?: Library_AttachmentsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_AttachmentsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_attachments(inputs)
	if (locale === "en-XA") return en_xa2_library_attachments(inputs)
	return en_library_attachments(inputs)
});