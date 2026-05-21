/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_General_SubtitleInputs */

const en_hub_general_subtitle = /** @type {(inputs: Hub_General_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization name, language, and country code`)
};

const es_hub_general_subtitle = /** @type {(inputs: Hub_General_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre de la organizacion, idioma y codigo de pais`)
};

/**
* | output |
* | --- |
* | "Organization name, language, and country code" |
*
* @param {Hub_General_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_general_subtitle = /** @type {((inputs?: Hub_General_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_General_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_general_subtitle(inputs)
	return es_hub_general_subtitle(inputs)
});