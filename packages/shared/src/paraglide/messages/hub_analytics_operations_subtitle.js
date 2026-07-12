/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Analytics_Operations_SubtitleInputs */

const en_hub_analytics_operations_subtitle = /** @type {(inputs: Hub_Analytics_Operations_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Coverage, shifts, and how the work is shared`)
};

const es_hub_analytics_operations_subtitle = /** @type {(inputs: Hub_Analytics_Operations_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cobertura, turnos y reparto del trabajo`)
};

/**
* | output |
* | --- |
* | "Coverage, shifts, and how the work is shared" |
*
* @param {Hub_Analytics_Operations_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_analytics_operations_subtitle = /** @type {((inputs?: Hub_Analytics_Operations_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Analytics_Operations_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_analytics_operations_subtitle(inputs)
	return es_hub_analytics_operations_subtitle(inputs)
});