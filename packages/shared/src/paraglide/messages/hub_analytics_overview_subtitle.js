/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Analytics_Overview_SubtitleInputs */

const en_hub_analytics_overview_subtitle = /** @type {(inputs: Hub_Analytics_Overview_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Key metrics and volume trends at a glance`)
};

const es_hub_analytics_overview_subtitle = /** @type {(inputs: Hub_Analytics_Overview_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Métricas clave y tendencias de volumen`)
};

const en_xa2_hub_analytics_overview_subtitle = /** @type {(inputs: Hub_Analytics_Overview_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Kèy mètrìcs ànd vòlùmè trènds àt à glàncè •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Key metrics and volume trends at a glance" |
*
* @param {Hub_Analytics_Overview_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_analytics_overview_subtitle = /** @type {((inputs?: Hub_Analytics_Overview_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Analytics_Overview_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_hub_analytics_overview_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_hub_analytics_overview_subtitle(inputs)
	return en_hub_analytics_overview_subtitle(inputs)
});