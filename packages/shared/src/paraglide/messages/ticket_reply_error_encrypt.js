/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Reply_Error_EncryptInputs */

const en_ticket_reply_error_encrypt = /** @type {(inputs: Ticket_Reply_Error_EncryptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not encrypt reply. Try again.`)
};

const es_ticket_reply_error_encrypt = /** @type {(inputs: Ticket_Reply_Error_EncryptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo cifrar la respuesta. Intenta de nuevo.`)
};

/**
* | output |
* | --- |
* | "Could not encrypt reply. Try again." |
*
* @param {Ticket_Reply_Error_EncryptInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_error_encrypt = /** @type {((inputs?: Ticket_Reply_Error_EncryptInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Reply_Error_EncryptInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_reply_error_encrypt(inputs)
	return es_ticket_reply_error_encrypt(inputs)
});