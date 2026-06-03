/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown>, Ticket: NonNullable<unknown> }} Dashboard_Activity_Ticket_CreatedInputs */

const en_dashboard_activity_ticket_created = /** @type {(inputs: Dashboard_Activity_Ticket_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`New ${i?.ticket}`)
};

const es_dashboard_activity_ticket_created = /** @type {(inputs: Dashboard_Activity_Ticket_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} nuevo`)
};

/**
* | output |
* | --- |
* | "New {ticket}" |
*
* @param {Dashboard_Activity_Ticket_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_ticket_created = /** @type {((inputs: Dashboard_Activity_Ticket_CreatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Activity_Ticket_CreatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_activity_ticket_created(inputs)
	return es_dashboard_activity_ticket_created(inputs)
});