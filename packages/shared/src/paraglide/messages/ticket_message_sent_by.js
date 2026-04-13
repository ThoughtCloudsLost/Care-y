/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown>, time: NonNullable<unknown> }} Ticket_Message_Sent_ByInputs */

const en_ticket_message_sent_by = /** @type {(inputs: Ticket_Message_Sent_ByInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Message sent by ${i?.name} at ${i?.time}`)
};

const es_ticket_message_sent_by = /** @type {(inputs: Ticket_Message_Sent_ByInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Mensaje enviado por ${i?.name} a las ${i?.time}`)
};

/**
* | output |
* | --- |
* | "Message sent by {name} at {time}" |
*
* @param {Ticket_Message_Sent_ByInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_message_sent_by = /** @type {((inputs: Ticket_Message_Sent_ByInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Message_Sent_ByInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_message_sent_by(inputs)
	return es_ticket_message_sent_by(inputs)
});