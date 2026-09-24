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

const en_xa2_twofa_sms_desc = /** @type {(inputs: Twofa_Sms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wè sènd à 6-dìgìt còdè tò yòùr phònè nùmbèr vìà tèxt mèssàgè. Thìs ìs thè wèàkèst òptìòn bècàùsè phònè nùmbèrs càn bè stòlèn thròùgh à tèchnìqùè càllèd SÌM-swàppìng. Ùsè ònly ìf nò òthèr òptìòn ìs àvàìlàblè fòr yòù. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "We send a 6-digit code to your phone number via text message. This is the weakest option because phone numbers can be stolen through a technique called SIM-s..." |
*
* @param {Twofa_Sms_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_sms_desc = /** @type {((inputs?: Twofa_Sms_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Sms_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_sms_desc(inputs)
	if (locale === "en-XA") return en_xa2_twofa_sms_desc(inputs)
	return en_twofa_sms_desc(inputs)
});