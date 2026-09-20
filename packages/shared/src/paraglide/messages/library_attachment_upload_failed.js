/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Attachment_Upload_FailedInputs */

const en_library_attachment_upload_failed = /** @type {(inputs: Library_Attachment_Upload_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Attachment upload failed`)
};

const es_library_attachment_upload_failed = /** @type {(inputs: Library_Attachment_Upload_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Error al subir el archivo adjunto`)
};

const en_xa2_library_attachment_upload_failed = /** @type {(inputs: Library_Attachment_Upload_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àttàchmènt ùplòàd fàìlèd ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Attachment upload failed" |
*
* @param {Library_Attachment_Upload_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_attachment_upload_failed = /** @type {((inputs?: Library_Attachment_Upload_FailedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Attachment_Upload_FailedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_attachment_upload_failed(inputs)
	if (locale === "en-XA") return en_xa2_library_attachment_upload_failed(inputs)
	return en_library_attachment_upload_failed(inputs)
});