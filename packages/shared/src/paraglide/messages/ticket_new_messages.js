/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_MessagesInputs */

const en_ticket_new_messages = /** @type {(inputs: Ticket_New_MessagesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New messages`)
};

const es_ticket_new_messages = /** @type {(inputs: Ticket_New_MessagesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mensajes nuevos`)
};

/**
* | output |
* | --- |
* | "New messages" |
*
* @param {Ticket_New_MessagesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_messages = /** @type {((inputs?: Ticket_New_MessagesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_MessagesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_messages(inputs)
	return es_ticket_new_messages(inputs)
});