/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_General_SubtitleInputs */

const en_hub_general_subtitle = /** @type {(inputs: Hub_General_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization name, language, and country code`)
};

const es_hub_general_subtitle = /** @type {(inputs: Hub_General_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre de la organización, idioma y código de país`)
};

const en_xa2_hub_general_subtitle = /** @type {(inputs: Hub_General_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòn nàmè, làngùàgè, ànd còùntry còdè ••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Organization name, language, and country code" |
*
* @param {Hub_General_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_general_subtitle = /** @type {((inputs?: Hub_General_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_General_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_hub_general_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_hub_general_subtitle(inputs)
	return en_hub_general_subtitle(inputs)
});