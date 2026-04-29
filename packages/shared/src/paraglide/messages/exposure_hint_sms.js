/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Exposure_Hint_SmsInputs */

const en_exposure_hint_sms = /** @type {(inputs: Exposure_Hint_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS is not encrypted. Your phone provider can read it. Keep sensitive details in the encrypted chat.`)
};

const es_exposure_hint_sms = /** @type {(inputs: Exposure_Hint_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los SMS no estan cifrados. Tu proveedor de telefonia puede leerlos. Mantiene los detalles sensibles en el chat cifrado.`)
};

/**
* | output |
* | --- |
* | "SMS is not encrypted. Your phone provider can read it. Keep sensitive details in the encrypted chat." |
*
* @param {Exposure_Hint_SmsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const exposure_hint_sms = /** @type {((inputs?: Exposure_Hint_SmsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Exposure_Hint_SmsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_exposure_hint_sms(inputs)
	return es_exposure_hint_sms(inputs)
});