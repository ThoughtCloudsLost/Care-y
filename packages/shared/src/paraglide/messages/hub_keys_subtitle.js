/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Keys_SubtitleInputs */

const en_hub_keys_subtitle = /** @type {(inputs: Hub_Keys_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Encryption key status and rotation`)
};

const es_hub_keys_subtitle = /** @type {(inputs: Hub_Keys_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estado de claves de cifrado y rotación`)
};

const en_xa2_hub_keys_subtitle = /** @type {(inputs: Hub_Keys_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èncryptìòn kèy stàtùs ànd ròtàtìòn •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Encryption key status and rotation" |
*
* @param {Hub_Keys_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_keys_subtitle = /** @type {((inputs?: Hub_Keys_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Keys_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_hub_keys_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_hub_keys_subtitle(inputs)
	return en_hub_keys_subtitle(inputs)
});