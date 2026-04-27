/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Telephony_SubtitleInputs */

const en_hub_telephony_subtitle = /** @type {(inputs: Hub_Telephony_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone numbers and call routing`)
};

const es_hub_telephony_subtitle = /** @type {(inputs: Hub_Telephony_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Numeros de telefono y enrutamiento de llamadas`)
};

/**
* | output |
* | --- |
* | "Phone numbers and call routing" |
*
* @param {Hub_Telephony_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_telephony_subtitle = /** @type {((inputs?: Hub_Telephony_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Telephony_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_telephony_subtitle(inputs)
	return es_hub_telephony_subtitle(inputs)
});