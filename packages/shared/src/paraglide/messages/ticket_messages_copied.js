/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Ticket_Messages_CopiedInputs */

const en_ticket_messages_copied = /** @type {(inputs: Ticket_Messages_CopiedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Copied ${i?.count} messages`)
};

const es_ticket_messages_copied = /** @type {(inputs: Ticket_Messages_CopiedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Se copiaron ${i?.count} mensajes`)
};

/**
* | output |
* | --- |
* | "Copied {count} messages" |
*
* @param {Ticket_Messages_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_messages_copied = /** @type {((inputs: Ticket_Messages_CopiedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Messages_CopiedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_messages_copied(inputs)
	return es_ticket_messages_copied(inputs)
});