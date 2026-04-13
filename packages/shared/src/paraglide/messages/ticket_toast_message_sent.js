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

/**
* | output |
* | --- |
* | "Message sent" |
*
* @param {Ticket_Toast_Message_SentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_message_sent = /** @type {((inputs?: Ticket_Toast_Message_SentInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_Message_SentInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_toast_message_sent(inputs)
	return es_ticket_toast_message_sent(inputs)
});