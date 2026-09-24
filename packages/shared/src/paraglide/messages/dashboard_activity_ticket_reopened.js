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

const en_xa2_dashboard_activity_ticket_reopened = /** @type {(inputs: Dashboard_Activity_Ticket_ReopenedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèòpènèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Reopened" |
*
* @param {Dashboard_Activity_Ticket_ReopenedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_ticket_reopened = /** @type {((inputs?: Dashboard_Activity_Ticket_ReopenedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Activity_Ticket_ReopenedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_activity_ticket_reopened(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_activity_ticket_reopened(inputs)
	return en_dashboard_activity_ticket_reopened(inputs)
});