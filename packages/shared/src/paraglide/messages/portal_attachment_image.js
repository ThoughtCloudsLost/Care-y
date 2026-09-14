/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Attachment_ImageInputs */

const en_portal_attachment_image = /** @type {(inputs: Portal_Attachment_ImageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Attached image`)
};

const es_portal_attachment_image = /** @type {(inputs: Portal_Attachment_ImageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Imagen adjunta`)
};

/**
* | output |
* | --- |
* | "Attached image" |
*
* @param {Portal_Attachment_ImageInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_attachment_image = /** @type {((inputs?: Portal_Attachment_ImageInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Attachment_ImageInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_attachment_image(inputs)
	return en_portal_attachment_image(inputs)
});