/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Ticket_Email_Inbound_Dropped_Attachments_OneInputs */

const en_ticket_email_inbound_dropped_attachments_one = /** @type {(inputs: Ticket_Email_Inbound_Dropped_Attachments_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} attachment was dropped`)
};

const es_ticket_email_inbound_dropped_attachments_one = /** @type {(inputs: Ticket_Email_Inbound_Dropped_Attachments_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Se descartó ${i?.count} archivo adjunto`)
};

const en_xa2_ticket_email_inbound_dropped_attachments_one = /** @type {(inputs: Ticket_Email_Inbound_Dropped_Attachments_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} àttàchmènt wàs dròppèd •••••••⟧`)
};

/**
* | output |
* | --- |
* | "{count} attachment was dropped" |
*
* @param {Ticket_Email_Inbound_Dropped_Attachments_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_inbound_dropped_attachments_one = /** @type {((inputs: Ticket_Email_Inbound_Dropped_Attachments_OneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Inbound_Dropped_Attachments_OneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_inbound_dropped_attachments_one(inputs)
	if (locale === "en-XA") return en_xa2_ticket_email_inbound_dropped_attachments_one(inputs)
	return en_ticket_email_inbound_dropped_attachments_one(inputs)
});