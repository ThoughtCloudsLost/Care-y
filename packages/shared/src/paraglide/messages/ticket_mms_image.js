/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Mms_ImageInputs */

const en_ticket_mms_image = /** @type {(inputs: Ticket_Mms_ImageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MMS image`)
};

const es_ticket_mms_image = /** @type {(inputs: Ticket_Mms_ImageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Imagen MMS`)
};

const en_xa2_ticket_mms_image = /** @type {(inputs: Ticket_Mms_ImageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦MMS ìmàgè •••⟧`)
};

/**
* | output |
* | --- |
* | "MMS image" |
*
* @param {Ticket_Mms_ImageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_mms_image = /** @type {((inputs?: Ticket_Mms_ImageInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Mms_ImageInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_mms_image(inputs)
	if (locale === "en-XA") return en_xa2_ticket_mms_image(inputs)
	return en_ticket_mms_image(inputs)
});