/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown>, tickets: NonNullable<unknown> }} Ticket_Panel_Recent_Coming_SoonInputs */

const en_ticket_panel_recent_coming_soon = /** @type {(inputs: Ticket_Panel_Recent_Coming_SoonInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Recent ${i?.ticket} history will appear here.`)
};

const es_ticket_panel_recent_coming_soon = /** @type {(inputs: Ticket_Panel_Recent_Coming_SoonInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`El historial de ${i?.tickets} recientes aparecera aqui.`)
};

/**
* | output |
* | --- |
* | "Recent {ticket} history will appear here." |
*
* @param {Ticket_Panel_Recent_Coming_SoonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_recent_coming_soon = /** @type {((inputs: Ticket_Panel_Recent_Coming_SoonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Panel_Recent_Coming_SoonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_panel_recent_coming_soon(inputs)
	return es_ticket_panel_recent_coming_soon(inputs)
});