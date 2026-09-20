/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Tickets: NonNullable<unknown>, tickets: NonNullable<unknown> }} Dashboard_Section_My_TicketsInputs */

const en_dashboard_section_my_tickets = /** @type {(inputs: Dashboard_Section_My_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`My ${i?.Tickets}`)
};

const es_dashboard_section_my_tickets = /** @type {(inputs: Dashboard_Section_My_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Mis ${i?.tickets}`)
};

const en_xa2_dashboard_section_my_tickets = /** @type {(inputs: Dashboard_Section_My_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦My  •${i?.Tickets}⟧`)
};

/**
* | output |
* | --- |
* | "My {Tickets}" |
*
* @param {Dashboard_Section_My_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_section_my_tickets = /** @type {((inputs: Dashboard_Section_My_TicketsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Section_My_TicketsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_section_my_tickets(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_section_my_tickets(inputs)
	return en_dashboard_section_my_tickets(inputs)
});