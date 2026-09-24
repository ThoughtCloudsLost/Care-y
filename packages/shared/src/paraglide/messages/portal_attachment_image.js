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

const en_xa2_portal_attachment_image = /** @type {(inputs: Portal_Attachment_ImageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àttàchèd ìmàgè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Attached image" |
*
* @param {Portal_Attachment_ImageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_attachment_image = /** @type {((inputs?: Portal_Attachment_ImageInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Attachment_ImageInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_attachment_image(inputs)
	if (locale === "en-XA") return en_xa2_portal_attachment_image(inputs)
	return en_portal_attachment_image(inputs)
});