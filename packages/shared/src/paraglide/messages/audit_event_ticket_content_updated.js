/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown>, ticket: NonNullable<unknown> }} Audit_Event_Ticket_Content_UpdatedInputs */

const en_audit_event_ticket_content_updated = /** @type {(inputs: Audit_Event_Ticket_Content_UpdatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} content updated`)
};

const es_audit_event_ticket_content_updated = /** @type {(inputs: Audit_Event_Ticket_Content_UpdatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Contenido de ${i?.ticket} actualizado`)
};

/**
* | output |
* | --- |
* | "{Ticket} content updated" |
*
* @param {Audit_Event_Ticket_Content_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_ticket_content_updated = /** @type {((inputs: Audit_Event_Ticket_Content_UpdatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Ticket_Content_UpdatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_ticket_content_updated(inputs)
	return es_audit_event_ticket_content_updated(inputs)
});