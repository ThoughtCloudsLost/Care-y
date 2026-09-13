/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Audit_Event_Ticket_ReopenedInputs */

const en_audit_event_ticket_reopened = /** @type {(inputs: Audit_Event_Ticket_ReopenedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} reopened`)
};

const es_audit_event_ticket_reopened = /** @type {(inputs: Audit_Event_Ticket_ReopenedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} reabierto`)
};

/**
* | output |
* | --- |
* | "{Ticket} reopened" |
*
* @param {Audit_Event_Ticket_ReopenedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_ticket_reopened = /** @type {((inputs: Audit_Event_Ticket_ReopenedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Ticket_ReopenedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_ticket_reopened(inputs)
	return es_audit_event_ticket_reopened(inputs)
});