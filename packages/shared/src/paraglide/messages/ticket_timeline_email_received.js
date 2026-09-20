/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ subject: NonNullable<unknown> }} Ticket_Timeline_Email_ReceivedInputs */

const en_ticket_timeline_email_received = /** @type {(inputs: Ticket_Timeline_Email_ReceivedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Email received: ${i?.subject}`)
};

const es_ticket_timeline_email_received = /** @type {(inputs: Ticket_Timeline_Email_ReceivedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Correo recibido: ${i?.subject}`)
};

const en_xa2_ticket_timeline_email_received = /** @type {(inputs: Ticket_Timeline_Email_ReceivedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl rècèìvèd:  •••••${i?.subject}⟧`)
};

/**
* | output |
* | --- |
* | "Email received: {subject}" |
*
* @param {Ticket_Timeline_Email_ReceivedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_email_received = /** @type {((inputs: Ticket_Timeline_Email_ReceivedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Timeline_Email_ReceivedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_timeline_email_received(inputs)
	if (locale === "en-XA") return en_xa2_ticket_timeline_email_received(inputs)
	return en_ticket_timeline_email_received(inputs)
});