/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Attachment_FailedInputs */

const en_attachment_failed = /** @type {(inputs: Attachment_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Did not upload`)
};

const es_attachment_failed = /** @type {(inputs: Attachment_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se subió`)
};

const en_xa2_attachment_failed = /** @type {(inputs: Attachment_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìd nòt ùplòàd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Did not upload" |
*
* @param {Attachment_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const attachment_failed = /** @type {((inputs?: Attachment_FailedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Attachment_FailedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_attachment_failed(inputs)
	if (locale === "en-XA") return en_xa2_attachment_failed(inputs)
	return en_attachment_failed(inputs)
});