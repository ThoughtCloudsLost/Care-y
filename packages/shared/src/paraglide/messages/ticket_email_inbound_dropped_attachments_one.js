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

/**
* | output |
* | --- |
* | "{count} attachment was dropped" |
*
* @param {Ticket_Email_Inbound_Dropped_Attachments_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_inbound_dropped_attachments_one = /** @type {((inputs: Ticket_Email_Inbound_Dropped_Attachments_OneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Inbound_Dropped_Attachments_OneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_inbound_dropped_attachments_one(inputs)
	return en_ticket_email_inbound_dropped_attachments_one(inputs)
});