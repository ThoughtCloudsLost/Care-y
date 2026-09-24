/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Timeline_Email_Sent_PlainInputs */

const en_ticket_timeline_email_sent_plain = /** @type {(inputs: Ticket_Timeline_Email_Sent_PlainInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email sent`)
};

const es_ticket_timeline_email_sent_plain = /** @type {(inputs: Ticket_Timeline_Email_Sent_PlainInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correo enviado`)
};

const en_xa2_ticket_timeline_email_sent_plain = /** @type {(inputs: Ticket_Timeline_Email_Sent_PlainInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl sènt •••⟧`)
};

/**
* | output |
* | --- |
* | "Email sent" |
*
* @param {Ticket_Timeline_Email_Sent_PlainInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_email_sent_plain = /** @type {((inputs?: Ticket_Timeline_Email_Sent_PlainInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Timeline_Email_Sent_PlainInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_timeline_email_sent_plain(inputs)
	if (locale === "en-XA") return en_xa2_ticket_timeline_email_sent_plain(inputs)
	return en_ticket_timeline_email_sent_plain(inputs)
});