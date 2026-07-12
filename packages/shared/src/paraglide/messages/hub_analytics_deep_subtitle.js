/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Analytics_Deep_SubtitleInputs */

const en_hub_analytics_deep_subtitle = /** @type {(inputs: Hub_Analytics_Deep_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Slower, heavier reports drawn from decrypted conversations, to understand what your community needs`)
};

const es_hub_analytics_deep_subtitle = /** @type {(inputs: Hub_Analytics_Deep_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reportes mas lentos y pesados, a partir de conversaciones descifradas, para entender lo que necesita tu comunidad`)
};

/**
* | output |
* | --- |
* | "Slower, heavier reports drawn from decrypted conversations, to understand what your community needs" |
*
* @param {Hub_Analytics_Deep_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_analytics_deep_subtitle = /** @type {((inputs?: Hub_Analytics_Deep_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Analytics_Deep_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_analytics_deep_subtitle(inputs)
	return es_hub_analytics_deep_subtitle(inputs)
});