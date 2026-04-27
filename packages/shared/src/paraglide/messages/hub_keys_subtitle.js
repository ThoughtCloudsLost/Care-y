/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Keys_SubtitleInputs */

const en_hub_keys_subtitle = /** @type {(inputs: Hub_Keys_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Encryption key status and rotation`)
};

const es_hub_keys_subtitle = /** @type {(inputs: Hub_Keys_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estado de claves de cifrado y rotacion`)
};

/**
* | output |
* | --- |
* | "Encryption key status and rotation" |
*
* @param {Hub_Keys_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_keys_subtitle = /** @type {((inputs?: Hub_Keys_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Keys_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_keys_subtitle(inputs)
	return es_hub_keys_subtitle(inputs)
});