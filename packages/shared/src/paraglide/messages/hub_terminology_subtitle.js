/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Terminology_SubtitleInputs */

const en_hub_terminology_subtitle = /** @type {(inputs: Hub_Terminology_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Customize role and item names across the app`)
};

const es_hub_terminology_subtitle = /** @type {(inputs: Hub_Terminology_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Personalizar nombres de roles y elementos en la aplicación`)
};

const en_xa2_hub_terminology_subtitle = /** @type {(inputs: Hub_Terminology_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cùstòmìzè ròlè ànd ìtèm nàmès àcròss thè àpp ••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Customize role and item names across the app" |
*
* @param {Hub_Terminology_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_terminology_subtitle = /** @type {((inputs?: Hub_Terminology_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Terminology_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_hub_terminology_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_hub_terminology_subtitle(inputs)
	return en_hub_terminology_subtitle(inputs)
});