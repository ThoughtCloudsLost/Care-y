/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Panel_CallInputs */

const en_ticket_panel_call = /** @type {(inputs: Ticket_Panel_CallInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call`)
};

const es_ticket_panel_call = /** @type {(inputs: Ticket_Panel_CallInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamar`)
};

/**
* | output |
* | --- |
* | "Call" |
*
* @param {Ticket_Panel_CallInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_call = /** @type {((inputs?: Ticket_Panel_CallInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Panel_CallInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_panel_call(inputs)
	return es_ticket_panel_call(inputs)
});