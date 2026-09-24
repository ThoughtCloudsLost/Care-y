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

const en_xa2_ticket_reply_encrypting = /** @type {(inputs: Ticket_Reply_EncryptingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èncryptìng... ••••⟧`)
};

/**
* | output |
* | --- |
* | "Encrypting..." |
*
* @param {Ticket_Reply_EncryptingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_encrypting = /** @type {((inputs?: Ticket_Reply_EncryptingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Reply_EncryptingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_reply_encrypting(inputs)
	if (locale === "en-XA") return en_xa2_ticket_reply_encrypting(inputs)
	return en_ticket_reply_encrypting(inputs)
});