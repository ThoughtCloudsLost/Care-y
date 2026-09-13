/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Ticket_Email_Inbound_Dropped_Attachments_OtherInputs */

const en_ticket_email_inbound_dropped_attachments_other = /** @type {(inputs: Ticket_Email_Inbound_Dropped_Attachments_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} attachments were dropped`)
};

const es_ticket_email_inbound_dropped_attachments_other = /** @type {(inputs: Ticket_Email_Inbound_Dropped_Attachments_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Se descartaron ${i?.count} archivos adjuntos`)
};

/**
* | output |
* | --- |
* | "{count} attachments were dropped" |
*
* @param {Ticket_Email_Inbound_Dropped_Attachments_OtherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_inbound_dropped_attachments_other = /** @type {((inputs: Ticket_Email_Inbound_Dropped_Attachments_OtherInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Inbound_Dropped_Attachments_OtherInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_email_inbound_dropped_attachments_other(inputs)
	return es_ticket_email_inbound_dropped_attachments_other(inputs)
});