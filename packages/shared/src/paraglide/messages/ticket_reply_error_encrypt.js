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

const en_xa2_ticket_reply_error_encrypt = /** @type {(inputs: Ticket_Reply_Error_EncryptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt èncrypt rèply. Try àgàìn. •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not encrypt reply. Try again." |
*
* @param {Ticket_Reply_Error_EncryptInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_error_encrypt = /** @type {((inputs?: Ticket_Reply_Error_EncryptInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Reply_Error_EncryptInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_reply_error_encrypt(inputs)
	if (locale === "en-XA") return en_xa2_ticket_reply_error_encrypt(inputs)
	return en_ticket_reply_error_encrypt(inputs)
});