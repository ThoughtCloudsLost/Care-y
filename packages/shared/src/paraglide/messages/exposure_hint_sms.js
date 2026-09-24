/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Exposure_Hint_SmsInputs */

const en_exposure_hint_sms = /** @type {(inputs: Exposure_Hint_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS is not encrypted. Your phone provider can read it. Keep sensitive details in the encrypted chat.`)
};

const es_exposure_hint_sms = /** @type {(inputs: Exposure_Hint_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los SMS no estan cifrados. Tu proveedor de telefonía puede leerlos. Mantiene los detalles sensibles en el chat cifrado.`)
};

const en_xa2_exposure_hint_sms = /** @type {(inputs: Exposure_Hint_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦SMS ìs nòt èncryptèd. Yòùr phònè pròvìdèr càn rèàd ìt. Kèèp sènsìtìvè dètàìls ìn thè èncryptèd chàt. ••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "SMS is not encrypted. Your phone provider can read it. Keep sensitive details in the encrypted chat." |
*
* @param {Exposure_Hint_SmsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const exposure_hint_sms = /** @type {((inputs?: Exposure_Hint_SmsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Exposure_Hint_SmsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_exposure_hint_sms(inputs)
	if (locale === "en-XA") return en_xa2_exposure_hint_sms(inputs)
	return en_exposure_hint_sms(inputs)
});