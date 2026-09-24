/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Attachment_Upload_FailedInputs */

const en_attachment_upload_failed = /** @type {(inputs: Attachment_Upload_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The file did not upload. Remove it and try again.`)
};

const es_attachment_upload_failed = /** @type {(inputs: Attachment_Upload_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El archivo no se subió. Quítalo e inténtalo de nuevo.`)
};

const en_xa2_attachment_upload_failed = /** @type {(inputs: Attachment_Upload_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè fìlè dìd nòt ùplòàd. Rèmòvè ìt ànd try àgàìn. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The file did not upload. Remove it and try again." |
*
* @param {Attachment_Upload_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const attachment_upload_failed = /** @type {((inputs?: Attachment_Upload_FailedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Attachment_Upload_FailedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_attachment_upload_failed(inputs)
	if (locale === "en-XA") return en_xa2_attachment_upload_failed(inputs)
	return en_attachment_upload_failed(inputs)
});