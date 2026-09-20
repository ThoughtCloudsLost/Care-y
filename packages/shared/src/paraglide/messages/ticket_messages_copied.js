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

const en_xa2_ticket_messages_copied = /** @type {(inputs: Ticket_Messages_CopiedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Còpìèd  •••${i?.count} mèssàgès •••⟧`)
};

/**
* | output |
* | --- |
* | "Copied {count} messages" |
*
* @param {Ticket_Messages_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_messages_copied = /** @type {((inputs: Ticket_Messages_CopiedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Messages_CopiedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_messages_copied(inputs)
	if (locale === "en-XA") return en_xa2_ticket_messages_copied(inputs)
	return en_ticket_messages_copied(inputs)
});