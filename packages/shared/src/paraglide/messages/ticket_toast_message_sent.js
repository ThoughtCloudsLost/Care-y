/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Toast_Message_SentInputs */

const en_ticket_toast_message_sent = /** @type {(inputs: Ticket_Toast_Message_SentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Message sent`)
};

const es_ticket_toast_message_sent = /** @type {(inputs: Ticket_Toast_Message_SentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mensaje enviado`)
};

const en_xa2_ticket_toast_message_sent = /** @type {(inputs: Ticket_Toast_Message_SentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèssàgè sènt ••••⟧`)
};

/**
* | output |
* | --- |
* | "Message sent" |
*
* @param {Ticket_Toast_Message_SentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_message_sent = /** @type {((inputs?: Ticket_Toast_Message_SentInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_Message_SentInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_toast_message_sent(inputs)
	if (locale === "en-XA") return en_xa2_ticket_toast_message_sent(inputs)
	return en_ticket_toast_message_sent(inputs)
});