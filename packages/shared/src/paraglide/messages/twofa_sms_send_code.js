/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Sms_Send_CodeInputs */

const en_twofa_sms_send_code = /** @type {(inputs: Twofa_Sms_Send_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send text message code`)
};

const es_twofa_sms_send_code = /** @type {(inputs: Twofa_Sms_Send_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar código por mensaje de texto`)
};

/**
* | output |
* | --- |
* | "Send text message code" |
*
* @param {Twofa_Sms_Send_CodeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_sms_send_code = /** @type {((inputs?: Twofa_Sms_Send_CodeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Sms_Send_CodeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_sms_send_code(inputs)
	return es_twofa_sms_send_code(inputs)
});