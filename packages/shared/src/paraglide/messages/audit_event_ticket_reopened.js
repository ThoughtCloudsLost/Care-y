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

const en_xa2_audit_event_ticket_reopened = /** @type {(inputs: Audit_Event_Ticket_ReopenedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Ticket} rèòpènèd •••⟧`)
};

/**
* | output |
* | --- |
* | "{Ticket} reopened" |
*
* @param {Audit_Event_Ticket_ReopenedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_ticket_reopened = /** @type {((inputs: Audit_Event_Ticket_ReopenedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Ticket_ReopenedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_ticket_reopened(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_ticket_reopened(inputs)
	return en_audit_event_ticket_reopened(inputs)
});