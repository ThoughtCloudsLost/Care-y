/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Reply_EncryptingInputs */

const en_ticket_reply_encrypting = /** @type {(inputs: Ticket_Reply_EncryptingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Encrypting...`)
};

const es_ticket_reply_encrypting = /** @type {(inputs: Ticket_Reply_EncryptingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cifrando...`)
};

/**
* | output |
* | --- |
* | "Encrypting..." |
*
* @param {Ticket_Reply_EncryptingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_encrypting = /** @type {((inputs?: Ticket_Reply_EncryptingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Reply_EncryptingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_reply_encrypting(inputs)
	return es_ticket_reply_encrypting(inputs)
});