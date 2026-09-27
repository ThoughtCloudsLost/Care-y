/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown>, tickets: NonNullable<unknown> }} Dashboard_Activity_Kind_TicketInputs */

const en_dashboard_activity_kind_ticket = /** @type {(inputs: Dashboard_Activity_Kind_TicketInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} activity`)
};

const es_dashboard_activity_kind_ticket = /** @type {(inputs: Dashboard_Activity_Kind_TicketInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Actividad de ${i?.tickets}`)
};

const en_xa2_dashboard_activity_kind_ticket = /** @type {(inputs: Dashboard_Activity_Kind_TicketInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Ticket} àctìvìty •••⟧`)
};

/**
* | output |
* | --- |
* | "{Ticket} activity" |
*
* @param {Dashboard_Activity_Kind_TicketInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_kind_ticket = /** @type {((inputs: Dashboard_Activity_Kind_TicketInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Activity_Kind_TicketInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_activity_kind_ticket(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_activity_kind_ticket(inputs)
	return en_dashboard_activity_kind_ticket(inputs)
});