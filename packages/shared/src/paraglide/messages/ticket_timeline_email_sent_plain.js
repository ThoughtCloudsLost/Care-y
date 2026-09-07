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

/**
* | output |
* | --- |
* | "Email sent" |
*
* @param {Ticket_Timeline_Email_Sent_PlainInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_email_sent_plain = /** @type {((inputs?: Ticket_Timeline_Email_Sent_PlainInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Timeline_Email_Sent_PlainInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_timeline_email_sent_plain(inputs)
	return es_ticket_timeline_email_sent_plain(inputs)
});