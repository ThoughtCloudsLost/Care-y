/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Audit_Event_Ticket_MergedInputs */

const en_audit_event_ticket_merged = /** @type {(inputs: Audit_Event_Ticket_MergedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} merged`)
};

const es_audit_event_ticket_merged = /** @type {(inputs: Audit_Event_Ticket_MergedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} fusionado`)
};

/**
* | output |
* | --- |
* | "{Ticket} merged" |
*
* @param {Audit_Event_Ticket_MergedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_ticket_merged = /** @type {((inputs: Audit_Event_Ticket_MergedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Ticket_MergedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_ticket_merged(inputs)
	return es_audit_event_ticket_merged(inputs)
});