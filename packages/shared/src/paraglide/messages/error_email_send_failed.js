/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Email_Send_FailedInputs */

const en_error_email_send_failed = /** @type {(inputs: Error_Email_Send_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email could not be delivered. Please try again.`)
};

const es_error_email_send_failed = /** @type {(inputs: Error_Email_Send_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo entregar el correo. Inténtalo de nuevo.`)
};

const en_xa2_error_email_send_failed = /** @type {(inputs: Error_Email_Send_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl còùld nòt bè dèlìvèrèd. Plèàsè try àgàìn. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Email could not be delivered. Please try again." |
*
* @param {Error_Email_Send_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_email_send_failed = /** @type {((inputs?: Error_Email_Send_FailedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Email_Send_FailedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_email_send_failed(inputs)
	if (locale === "en-XA") return en_xa2_error_email_send_failed(inputs)
	return en_error_email_send_failed(inputs)
});