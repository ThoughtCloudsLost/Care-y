/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Sms_DescInputs */

const en_twofa_sms_desc = /** @type {(inputs: Twofa_Sms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`We send a 6-digit code to your phone number via text message. This is the weakest option because phone numbers can be stolen through a technique called SIM-swapping. Use only if no other option is available for you.`)
};

const es_twofa_sms_desc = /** @type {(inputs: Twofa_Sms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviamos un código de 6 dígitos a tu número de teléfono por mensaje de texto. Esta es la opción menos segura porque los números de teléfono pueden ser robados mediante una técnica llamada SIM-swapping. Úsala solo si no tienes otra opción disponible.`)
};

/**
* | output |
* | --- |
* | "We send a 6-digit code to your phone number via text message. This is the weakest option because phone numbers can be stolen through a technique called SIM-s..." |
*
* @param {Twofa_Sms_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_sms_desc = /** @type {((inputs?: Twofa_Sms_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Sms_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_sms_desc(inputs)
	return es_twofa_sms_desc(inputs)
});