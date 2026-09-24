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

const en_xa2_dashboard_activity_ticket_closed = /** @type {(inputs: Dashboard_Activity_Ticket_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clòsèd ••⟧`)
};

/**
* | output |
* | --- |
* | "Closed" |
*
* @param {Dashboard_Activity_Ticket_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_ticket_closed = /** @type {((inputs?: Dashboard_Activity_Ticket_ClosedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Activity_Ticket_ClosedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_activity_ticket_closed(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_activity_ticket_closed(inputs)
	return en_dashboard_activity_ticket_closed(inputs)
});