/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Exposure_Hint_CallInputs */

const en_exposure_hint_call = /** @type {(inputs: Exposure_Hint_CallInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This call routes through your phone provider. They can hear the call. Keep sensitive details in the encrypted chat.`)
};

const es_exposure_hint_call = /** @type {(inputs: Exposure_Hint_CallInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta llamada pasa por tu proveedor de telefonia. Pueden escuchar la llamada. Mantiene los detalles sensibles en el chat cifrado.`)
};

/**
* | output |
* | --- |
* | "This call routes through your phone provider. They can hear the call. Keep sensitive details in the encrypted chat." |
*
* @param {Exposure_Hint_CallInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const exposure_hint_call = /** @type {((inputs?: Exposure_Hint_CallInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Exposure_Hint_CallInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_exposure_hint_call(inputs)
	return es_exposure_hint_call(inputs)
});