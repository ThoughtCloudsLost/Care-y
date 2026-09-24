/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_One_Message_CopiedInputs */

const en_ticket_one_message_copied = /** @type {(inputs: Ticket_One_Message_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copied 1 message`)
};

const es_ticket_one_message_copied = /** @type {(inputs: Ticket_One_Message_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se copió 1 mensaje`)
};

const en_xa2_ticket_one_message_copied = /** @type {(inputs: Ticket_One_Message_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còpìèd 1 mèssàgè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Copied 1 message" |
*
* @param {Ticket_One_Message_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_one_message_copied = /** @type {((inputs?: Ticket_One_Message_CopiedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_One_Message_CopiedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_one_message_copied(inputs)
	if (locale === "en-XA") return en_xa2_ticket_one_message_copied(inputs)
	return en_ticket_one_message_copied(inputs)
});