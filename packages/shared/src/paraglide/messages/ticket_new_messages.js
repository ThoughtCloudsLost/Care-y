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

const en_xa2_ticket_new_messages = /** @type {(inputs: Ticket_New_MessagesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèw mèssàgès ••••⟧`)
};

/**
* | output |
* | --- |
* | "New messages" |
*
* @param {Ticket_New_MessagesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_messages = /** @type {((inputs?: Ticket_New_MessagesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_MessagesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_messages(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_messages(inputs)
	return en_ticket_new_messages(inputs)
});