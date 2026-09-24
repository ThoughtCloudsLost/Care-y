/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Analytics_Deep_SubtitleInputs */

const en_hub_analytics_deep_subtitle = /** @type {(inputs: Hub_Analytics_Deep_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Slower, heavier reports drawn from decrypted conversations, to understand what your community needs`)
};

const es_hub_analytics_deep_subtitle = /** @type {(inputs: Hub_Analytics_Deep_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reportes más lentos y pesados, a partir de conversaciones descifradas, para entender lo que necesita tu comunidad`)
};

const en_xa2_hub_analytics_deep_subtitle = /** @type {(inputs: Hub_Analytics_Deep_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Slòwèr, hèàvìèr rèpòrts dràwn fròm dècryptèd cònvèrsàtìòns, tò ùndèrstànd whàt yòùr còmmùnìty nèèds ••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Slower, heavier reports drawn from decrypted conversations, to understand what your community needs" |
*
* @param {Hub_Analytics_Deep_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_analytics_deep_subtitle = /** @type {((inputs?: Hub_Analytics_Deep_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Analytics_Deep_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_hub_analytics_deep_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_hub_analytics_deep_subtitle(inputs)
	return en_hub_analytics_deep_subtitle(inputs)
});