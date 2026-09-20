/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Audit_Event_Ticket_CreatedInputs */

const en_audit_event_ticket_created = /** @type {(inputs: Audit_Event_Ticket_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} created`)
};

const es_audit_event_ticket_created = /** @type {(inputs: Audit_Event_Ticket_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} creado`)
};

const en_xa2_audit_event_ticket_created = /** @type {(inputs: Audit_Event_Ticket_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Ticket} crèàtèd •••⟧`)
};

/**
* | output |
* | --- |
* | "{Ticket} created" |
*
* @param {Audit_Event_Ticket_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_ticket_created = /** @type {((inputs: Audit_Event_Ticket_CreatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Ticket_CreatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_ticket_created(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_ticket_created(inputs)
	return en_audit_event_ticket_created(inputs)
});