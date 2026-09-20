/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Audit_Event_Ticket_EscalatedInputs */

const en_audit_event_ticket_escalated = /** @type {(inputs: Audit_Event_Ticket_EscalatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} escalated`)
};

const es_audit_event_ticket_escalated = /** @type {(inputs: Audit_Event_Ticket_EscalatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} escalado`)
};

const en_xa2_audit_event_ticket_escalated = /** @type {(inputs: Audit_Event_Ticket_EscalatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Ticket} èscàlàtèd •••⟧`)
};

/**
* | output |
* | --- |
* | "{Ticket} escalated" |
*
* @param {Audit_Event_Ticket_EscalatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_ticket_escalated = /** @type {((inputs: Audit_Event_Ticket_EscalatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Ticket_EscalatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_ticket_escalated(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_ticket_escalated(inputs)
	return en_audit_event_ticket_escalated(inputs)
});