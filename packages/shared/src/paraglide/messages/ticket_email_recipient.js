/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ email: NonNullable<unknown> }} Ticket_Email_RecipientInputs */

const en_ticket_email_recipient = /** @type {(inputs: Ticket_Email_RecipientInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`To: ${i?.email}`)
};

const es_ticket_email_recipient = /** @type {(inputs: Ticket_Email_RecipientInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Para: ${i?.email}`)
};

const en_xa2_ticket_email_recipient = /** @type {(inputs: Ticket_Email_RecipientInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Tò:  ••${i?.email}⟧`)
};

/**
* | output |
* | --- |
* | "To: {email}" |
*
* @param {Ticket_Email_RecipientInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_recipient = /** @type {((inputs: Ticket_Email_RecipientInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_RecipientInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_recipient(inputs)
	if (locale === "en-XA") return en_xa2_ticket_email_recipient(inputs)
	return en_ticket_email_recipient(inputs)
});