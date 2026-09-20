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

const en_xa2_admin_reports_open_tickets = /** @type {(inputs: Admin_Reports_Open_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Òpèn  ••${i?.tickets}⟧`)
};

/**
* | output |
* | --- |
* | "Open {tickets}" |
*
* @param {Admin_Reports_Open_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reports_open_tickets = /** @type {((inputs: Admin_Reports_Open_TicketsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_Open_TicketsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_reports_open_tickets(inputs)
	if (locale === "en-XA") return en_xa2_admin_reports_open_tickets(inputs)
	return en_admin_reports_open_tickets(inputs)
});