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

/**
* | output |
* | --- |
* | "Zoom in" |
*
* @param {Ticket_Zoom_InInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_zoom_in = /** @type {((inputs?: Ticket_Zoom_InInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Zoom_InInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_zoom_in(inputs)
	return es_ticket_zoom_in(inputs)
});