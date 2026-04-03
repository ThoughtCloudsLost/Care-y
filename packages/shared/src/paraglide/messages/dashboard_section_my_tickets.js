/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Section_My_TicketsInputs */

const en_dashboard_section_my_tickets = /** @type {(inputs: Dashboard_Section_My_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`My Tickets`)
};

const es_dashboard_section_my_tickets = /** @type {(inputs: Dashboard_Section_My_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mis tickets`)
};

/**
* | output |
* | --- |
* | "My Tickets" |
*
* @param {Dashboard_Section_My_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_section_my_tickets = /** @type {((inputs?: Dashboard_Section_My_TicketsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Section_My_TicketsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_section_my_tickets(inputs)
	return es_dashboard_section_my_tickets(inputs)
});