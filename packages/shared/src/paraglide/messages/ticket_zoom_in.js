/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Zoom_InInputs */

const en_ticket_zoom_in = /** @type {(inputs: Ticket_Zoom_InInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zoom in`)
};

const es_ticket_zoom_in = /** @type {(inputs: Ticket_Zoom_InInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Acercar`)
};

const en_xa2_ticket_zoom_in = /** @type {(inputs: Ticket_Zoom_InInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Zòòm ìn •••⟧`)
};

/**
* | output |
* | --- |
* | "Zoom in" |
*
* @param {Ticket_Zoom_InInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_zoom_in = /** @type {((inputs?: Ticket_Zoom_InInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Zoom_InInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_zoom_in(inputs)
	if (locale === "en-XA") return en_xa2_ticket_zoom_in(inputs)
	return en_ticket_zoom_in(inputs)
});