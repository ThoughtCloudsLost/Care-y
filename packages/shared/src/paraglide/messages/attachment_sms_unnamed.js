/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Attachment_Sms_UnnamedInputs */

const en_attachment_sms_unnamed = /** @type {(inputs: Attachment_Sms_UnnamedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`File from text message`)
};

const es_attachment_sms_unnamed = /** @type {(inputs: Attachment_Sms_UnnamedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Archivo del mensaje de texto`)
};

/**
* | output |
* | --- |
* | "File from text message" |
*
* @param {Attachment_Sms_UnnamedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const attachment_sms_unnamed = /** @type {((inputs?: Attachment_Sms_UnnamedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Attachment_Sms_UnnamedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_attachment_sms_unnamed(inputs)
	return en_attachment_sms_unnamed(inputs)
});