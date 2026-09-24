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

const en_xa2_ticket_panel_call = /** @type {(inputs: Ticket_Panel_CallInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càll ••⟧`)
};

/**
* | output |
* | --- |
* | "Call" |
*
* @param {Ticket_Panel_CallInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_call = /** @type {((inputs?: Ticket_Panel_CallInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Panel_CallInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_panel_call(inputs)
	if (locale === "en-XA") return en_xa2_ticket_panel_call(inputs)
	return en_ticket_panel_call(inputs)
});