/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Email_Send_CodeInputs */

const en_twofa_email_send_code = /** @type {(inputs: Twofa_Email_Send_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send verification code`)
};

const es_twofa_email_send_code = /** @type {(inputs: Twofa_Email_Send_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar código de verificación`)
};

/**
* | output |
* | --- |
* | "Send verification code" |
*
* @param {Twofa_Email_Send_CodeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_email_send_code = /** @type {((inputs?: Twofa_Email_Send_CodeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Email_Send_CodeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_email_send_code(inputs)
	return es_twofa_email_send_code(inputs)
});