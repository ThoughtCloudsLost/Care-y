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

const en_xa2_twofa_email_send_code = /** @type {(inputs: Twofa_Email_Send_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sènd vèrìfìcàtìòn còdè •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Send verification code" |
*
* @param {Twofa_Email_Send_CodeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_email_send_code = /** @type {((inputs?: Twofa_Email_Send_CodeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Email_Send_CodeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_email_send_code(inputs)
	if (locale === "en-XA") return en_xa2_twofa_email_send_code(inputs)
	return en_twofa_email_send_code(inputs)
});