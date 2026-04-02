/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Activity_Ticket_ReopenedInputs */

const en_dashboard_activity_ticket_reopened = /** @type {(inputs: Dashboard_Activity_Ticket_ReopenedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reopened`)
};

const es_dashboard_activity_ticket_reopened = /** @type {(inputs: Dashboard_Activity_Ticket_ReopenedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reabierto`)
};

/**
* | output |
* | --- |
* | "Reopened" |
*
* @param {Dashboard_Activity_Ticket_ReopenedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_ticket_reopened = /** @type {((inputs?: Dashboard_Activity_Ticket_ReopenedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Activity_Ticket_ReopenedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_activity_ticket_reopened(inputs)
	return es_dashboard_activity_ticket_reopened(inputs)
});