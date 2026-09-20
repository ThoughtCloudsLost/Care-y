/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Mms_Lightbox_LabelInputs */

const en_ticket_mms_lightbox_label = /** @type {(inputs: Ticket_Mms_Lightbox_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Full-size image`)
};

const es_ticket_mms_lightbox_label = /** @type {(inputs: Ticket_Mms_Lightbox_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Imagen en tamaño completo`)
};

const en_xa2_ticket_mms_lightbox_label = /** @type {(inputs: Ticket_Mms_Lightbox_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fùll-sìzè ìmàgè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Full-size image" |
*
* @param {Ticket_Mms_Lightbox_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_mms_lightbox_label = /** @type {((inputs?: Ticket_Mms_Lightbox_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Mms_Lightbox_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_mms_lightbox_label(inputs)
	if (locale === "en-XA") return en_xa2_ticket_mms_lightbox_label(inputs)
	return en_ticket_mms_lightbox_label(inputs)
});