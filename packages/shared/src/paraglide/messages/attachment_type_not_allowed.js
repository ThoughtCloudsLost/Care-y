/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Attachment_Type_Not_AllowedInputs */

const en_attachment_type_not_allowed = /** @type {(inputs: Attachment_Type_Not_AllowedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`That kind of file cannot be sent here.`)
};

const es_attachment_type_not_allowed = /** @type {(inputs: Attachment_Type_Not_AllowedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ese tipo de archivo no se puede enviar aquí.`)
};

/**
* | output |
* | --- |
* | "That kind of file cannot be sent here." |
*
* @param {Attachment_Type_Not_AllowedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const attachment_type_not_allowed = /** @type {((inputs?: Attachment_Type_Not_AllowedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Attachment_Type_Not_AllowedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_attachment_type_not_allowed(inputs)
	return es_attachment_type_not_allowed(inputs)
});