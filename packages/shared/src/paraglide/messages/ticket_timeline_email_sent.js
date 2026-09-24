/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ subject: NonNullable<unknown> }} Ticket_Timeline_Email_SentInputs */

const en_ticket_timeline_email_sent = /** @type {(inputs: Ticket_Timeline_Email_SentInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Email sent: ${i?.subject}`)
};

const es_ticket_timeline_email_sent = /** @type {(inputs: Ticket_Timeline_Email_SentInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Correo enviado: ${i?.subject}`)
};

const en_xa2_ticket_timeline_email_sent = /** @type {(inputs: Ticket_Timeline_Email_SentInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl sènt:  ••••${i?.subject}⟧`)
};

/**
* | output |
* | --- |
* | "Email sent: {subject}" |
*
* @param {Ticket_Timeline_Email_SentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_email_sent = /** @type {((inputs: Ticket_Timeline_Email_SentInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Timeline_Email_SentInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_timeline_email_sent(inputs)
	if (locale === "en-XA") return en_xa2_ticket_timeline_email_sent(inputs)
	return en_ticket_timeline_email_sent(inputs)
});