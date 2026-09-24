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

const en_xa2_ticket_message_sent_by = /** @type {(inputs: Ticket_Message_Sent_ByInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Mèssàgè sènt by  •••••${i?.name} àt  ••${i?.time}⟧`)
};

/**
* | output |
* | --- |
* | "Message sent by {name} at {time}" |
*
* @param {Ticket_Message_Sent_ByInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_message_sent_by = /** @type {((inputs: Ticket_Message_Sent_ByInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Message_Sent_ByInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_message_sent_by(inputs)
	if (locale === "en-XA") return en_xa2_ticket_message_sent_by(inputs)
	return en_ticket_message_sent_by(inputs)
});