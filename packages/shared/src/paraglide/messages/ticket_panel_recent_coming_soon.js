/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown>, tickets: NonNullable<unknown> }} Ticket_Panel_Recent_Coming_SoonInputs */

const en_ticket_panel_recent_coming_soon = /** @type {(inputs: Ticket_Panel_Recent_Coming_SoonInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Recent ${i?.ticket} history will appear here.`)
};

const es_ticket_panel_recent_coming_soon = /** @type {(inputs: Ticket_Panel_Recent_Coming_SoonInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`El historial de ${i?.tickets} recientes aparecerá aquí.`)
};

const en_xa2_ticket_panel_recent_coming_soon = /** @type {(inputs: Ticket_Panel_Recent_Coming_SoonInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Rècènt  •••${i?.ticket} hìstòry wìll àppèàr hèrè. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Recent {ticket} history will appear here." |
*
* @param {Ticket_Panel_Recent_Coming_SoonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_recent_coming_soon = /** @type {((inputs: Ticket_Panel_Recent_Coming_SoonInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Panel_Recent_Coming_SoonInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_panel_recent_coming_soon(inputs)
	if (locale === "en-XA") return en_xa2_ticket_panel_recent_coming_soon(inputs)
	return en_ticket_panel_recent_coming_soon(inputs)
});