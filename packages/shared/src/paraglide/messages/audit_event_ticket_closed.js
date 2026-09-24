/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Audit_Event_Ticket_ClosedInputs */

const en_audit_event_ticket_closed = /** @type {(inputs: Audit_Event_Ticket_ClosedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} closed`)
};

const es_audit_event_ticket_closed = /** @type {(inputs: Audit_Event_Ticket_ClosedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} cerrado`)
};

const en_xa2_audit_event_ticket_closed = /** @type {(inputs: Audit_Event_Ticket_ClosedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Ticket} clòsèd •••⟧`)
};

/**
* | output |
* | --- |
* | "{Ticket} closed" |
*
* @param {Audit_Event_Ticket_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_ticket_closed = /** @type {((inputs: Audit_Event_Ticket_ClosedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Ticket_ClosedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_ticket_closed(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_ticket_closed(inputs)
	return en_audit_event_ticket_closed(inputs)
});