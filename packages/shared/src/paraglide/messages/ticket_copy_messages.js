/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Ticket_Copy_MessagesInputs */

const en_ticket_copy_messages = /** @type {(inputs: Ticket_Copy_MessagesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Copy ${i?.count} messages`)
};

const es_ticket_copy_messages = /** @type {(inputs: Ticket_Copy_MessagesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Copiar ${i?.count} mensajes`)
};

/**
* | output |
* | --- |
* | "Copy {count} messages" |
*
* @param {Ticket_Copy_MessagesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_copy_messages = /** @type {((inputs: Ticket_Copy_MessagesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Copy_MessagesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_copy_messages(inputs)
	return es_ticket_copy_messages(inputs)
});