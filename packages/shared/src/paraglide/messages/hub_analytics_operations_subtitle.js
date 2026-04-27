/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Analytics_Operations_SubtitleInputs */

const en_hub_analytics_operations_subtitle = /** @type {(inputs: Hub_Analytics_Operations_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Staffing, workload, and scheduling insights`)
};

const es_hub_analytics_operations_subtitle = /** @type {(inputs: Hub_Analytics_Operations_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Personal, carga de trabajo y programacion`)
};

/**
* | output |
* | --- |
* | "Staffing, workload, and scheduling insights" |
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