/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Activity_Ticket_ClosedInputs */

const en_dashboard_activity_ticket_closed = /** @type {(inputs: Dashboard_Activity_Ticket_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Closed`)
};

const es_dashboard_activity_ticket_closed = /** @type {(inputs: Dashboard_Activity_Ticket_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrado`)
};

/**
* | output |
* | --- |
* | "Closed" |
*
* @param {Dashboard_Activity_Ticket_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_ticket_closed = /** @type {((inputs?: Dashboard_Activity_Ticket_ClosedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Activity_Ticket_ClosedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_activity_ticket_closed(inputs)
	return es_dashboard_activity_ticket_closed(inputs)
});