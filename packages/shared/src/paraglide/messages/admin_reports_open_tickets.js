/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown>, Tickets: NonNullable<unknown> }} Admin_Reports_Open_TicketsInputs */

const en_admin_reports_open_tickets = /** @type {(inputs: Admin_Reports_Open_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Open ${i?.tickets}`)
};

const es_admin_reports_open_tickets = /** @type {(inputs: Admin_Reports_Open_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets} abiertos`)
};

/**
* | output |
* | --- |
* | "Open {tickets}" |
*
* @param {Admin_Reports_Open_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reports_open_tickets = /** @type {((inputs: Admin_Reports_Open_TicketsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_Open_TicketsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_reports_open_tickets(inputs)
	return es_admin_reports_open_tickets(inputs)
});