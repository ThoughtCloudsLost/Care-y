/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Zoom_ToggleInputs */

const en_ticket_zoom_toggle = /** @type {(inputs: Ticket_Zoom_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toggle zoom`)
};

const es_ticket_zoom_toggle = /** @type {(inputs: Ticket_Zoom_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alternar zoom`)
};

const en_xa2_ticket_zoom_toggle = /** @type {(inputs: Ticket_Zoom_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tògglè zòòm ••••⟧`)
};

/**
* | output |
* | --- |
* | "Toggle zoom" |
*
* @param {Ticket_Zoom_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_zoom_toggle = /** @type {((inputs?: Ticket_Zoom_ToggleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Zoom_ToggleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_zoom_toggle(inputs)
	if (locale === "en-XA") return en_xa2_ticket_zoom_toggle(inputs)
	return en_ticket_zoom_toggle(inputs)
});