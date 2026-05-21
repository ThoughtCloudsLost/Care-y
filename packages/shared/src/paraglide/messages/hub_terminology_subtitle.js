/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Terminology_SubtitleInputs */

const en_hub_terminology_subtitle = /** @type {(inputs: Hub_Terminology_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Customize role and item names across the app`)
};

const es_hub_terminology_subtitle = /** @type {(inputs: Hub_Terminology_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Personalizar nombres de roles y elementos en la aplicacion`)
};

/**
* | output |
* | --- |
* | "Customize role and item names across the app" |
*
* @param {Hub_Terminology_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_terminology_subtitle = /** @type {((inputs?: Hub_Terminology_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Terminology_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_terminology_subtitle(inputs)
	return es_hub_terminology_subtitle(inputs)
});