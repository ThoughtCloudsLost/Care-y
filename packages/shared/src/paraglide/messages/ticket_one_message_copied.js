/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_One_Message_CopiedInputs */

const en_ticket_one_message_copied = /** @type {(inputs: Ticket_One_Message_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copied 1 message`)
};

const es_ticket_one_message_copied = /** @type {(inputs: Ticket_One_Message_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se copio 1 mensaje`)
};

/**
* | output |
* | --- |
* | "Copied 1 message" |
*
* @param {Ticket_One_Message_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_one_message_copied = /** @type {((inputs?: Ticket_One_Message_CopiedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_One_Message_CopiedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_one_message_copied(inputs)
	return es_ticket_one_message_copied(inputs)
});