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

/**
* | output |
* | --- |
* | "Full-size image" |
*
* @param {Ticket_Mms_Lightbox_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_mms_lightbox_label = /** @type {((inputs?: Ticket_Mms_Lightbox_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Mms_Lightbox_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_mms_lightbox_label(inputs)
	return es_ticket_mms_lightbox_label(inputs)
});