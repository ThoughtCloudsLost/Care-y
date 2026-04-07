/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ alias: NonNullable<unknown> }} Ticket_Conversation_WithInputs */

const en_ticket_conversation_with = /** @type {(inputs: Ticket_Conversation_WithInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Conversation with ${i?.alias}`)
};

const es_ticket_conversation_with = /** @type {(inputs: Ticket_Conversation_WithInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Conversacion con ${i?.alias}`)
};

/**
* | output |
* | --- |
* | "Conversation with {alias}" |
*
* @param {Ticket_Conversation_WithInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_conversation_with = /** @type {((inputs: Ticket_Conversation_WithInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Conversation_WithInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_conversation_with(inputs)
	return es_ticket_conversation_with(inputs)
});