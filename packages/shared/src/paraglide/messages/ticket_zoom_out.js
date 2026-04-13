/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Zoom_OutInputs */

const en_ticket_zoom_out = /** @type {(inputs: Ticket_Zoom_OutInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zoom out`)
};

const es_ticket_zoom_out = /** @type {(inputs: Ticket_Zoom_OutInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alejar`)
};

/**
* | output |
* | --- |
* | "Zoom out" |
*
* @param {Ticket_Zoom_OutInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_zoom_out = /** @type {((inputs?: Ticket_Zoom_OutInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Zoom_OutInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_zoom_out(inputs)
	return es_ticket_zoom_out(inputs)
});