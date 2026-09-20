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

const en_xa2_audit_event_ticket_merged = /** @type {(inputs: Audit_Event_Ticket_MergedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Ticket} mèrgèd •••⟧`)
};

/**
* | output |
* | --- |
* | "{Ticket} merged" |
*
* @param {Audit_Event_Ticket_MergedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_ticket_merged = /** @type {((inputs: Audit_Event_Ticket_MergedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Ticket_MergedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_ticket_merged(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_ticket_merged(inputs)
	return en_audit_event_ticket_merged(inputs)
});