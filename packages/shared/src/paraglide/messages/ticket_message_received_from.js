/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown>, time: NonNullable<unknown> }} Ticket_Message_Received_FromInputs */

const en_ticket_message_received_from = /** @type {(inputs: Ticket_Message_Received_FromInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Message received from ${i?.name} at ${i?.time}`)
};

const es_ticket_message_received_from = /** @type {(inputs: Ticket_Message_Received_FromInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Mensaje recibido de ${i?.name} a las ${i?.time}`)
};

/**
* | output |
* | --- |
* | "Message received from {name} at {time}" |
*
* @param {Ticket_Message_Received_FromInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_message_received_from = /** @type {((inputs: Ticket_Message_Received_FromInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Message_Received_FromInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_message_received_from(inputs)
	return es_ticket_message_received_from(inputs)
});