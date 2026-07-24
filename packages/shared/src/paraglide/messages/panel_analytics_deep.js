/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_Analytics_DeepInputs */

const en_panel_analytics_deep = /** @type {(inputs: Panel_Analytics_DeepInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Research`)
};

const es_panel_analytics_deep = /** @type {(inputs: Panel_Analytics_DeepInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estudios`)
};

/**
* | output |
* | --- |
* | "Research" |
*
* @param {Panel_Analytics_DeepInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_analytics_deep = /** @type {((inputs?: Panel_Analytics_DeepInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_Analytics_DeepInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_analytics_deep(inputs)
	return es_panel_analytics_deep(inputs)
});