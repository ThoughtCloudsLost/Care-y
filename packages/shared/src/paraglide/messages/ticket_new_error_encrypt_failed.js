/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown> }} Ticket_New_Error_Encrypt_FailedInputs */

const en_ticket_new_error_encrypt_failed = /** @type {(inputs: Ticket_New_Error_Encrypt_FailedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Could not encrypt ${i?.ticket} data. Try again.`)
};

const es_ticket_new_error_encrypt_failed = /** @type {(inputs: Ticket_New_Error_Encrypt_FailedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No se pudieron cifrar los datos del ${i?.ticket}. Intenta de nuevo.`)
};

const en_xa2_ticket_new_error_encrypt_failed = /** @type {(inputs: Ticket_New_Error_Encrypt_FailedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt èncrypt  ••••••${i?.ticket} dàtà. Try àgàìn. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not encrypt {ticket} data. Try again." |
*
* @param {Ticket_New_Error_Encrypt_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_error_encrypt_failed = /** @type {((inputs: Ticket_New_Error_Encrypt_FailedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Error_Encrypt_FailedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_error_encrypt_failed(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_error_encrypt_failed(inputs)
	return en_ticket_new_error_encrypt_failed(inputs)
});