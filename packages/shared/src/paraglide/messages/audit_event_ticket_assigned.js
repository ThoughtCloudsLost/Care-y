/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Audit_Event_Ticket_AssignedInputs */

const en_audit_event_ticket_assigned = /** @type {(inputs: Audit_Event_Ticket_AssignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} assigned`)
};

const es_audit_event_ticket_assigned = /** @type {(inputs: Audit_Event_Ticket_AssignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} asignado`)
};

/**
* | output |
* | --- |
* | "{Ticket} assigned" |
*
* @param {Audit_Event_Ticket_AssignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_ticket_assigned = /** @type {((inputs: Audit_Event_Ticket_AssignedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Ticket_AssignedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_ticket_assigned(inputs)
	return es_audit_event_ticket_assigned(inputs)
});