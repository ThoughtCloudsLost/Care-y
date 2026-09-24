/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Email_Invalid_ErrorInputs */

const en_client_email_invalid_error = /** @type {(inputs: Client_Email_Invalid_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter a valid email address`)
};

const es_client_email_invalid_error = /** @type {(inputs: Client_Email_Invalid_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Introduce una dirección de correo válida`)
};

const en_xa2_client_email_invalid_error = /** @type {(inputs: Client_Email_Invalid_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr à vàlìd èmàìl àddrèss •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter a valid email address" |
*
* @param {Client_Email_Invalid_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_email_invalid_error = /** @type {((inputs?: Client_Email_Invalid_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Email_Invalid_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_email_invalid_error(inputs)
	if (locale === "en-XA") return en_xa2_client_email_invalid_error(inputs)
	return en_client_email_invalid_error(inputs)
});