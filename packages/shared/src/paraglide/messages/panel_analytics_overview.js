/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_Analytics_OverviewInputs */

const en_panel_analytics_overview = /** @type {(inputs: Panel_Analytics_OverviewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Impact`)
};

const es_panel_analytics_overview = /** @type {(inputs: Panel_Analytics_OverviewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Impacto`)
};

/**
* | output |
* | --- |
* | "Impact" |
*
* @param {Panel_Analytics_OverviewInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_analytics_overview = /** @type {((inputs?: Panel_Analytics_OverviewInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_Analytics_OverviewInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_analytics_overview(inputs)
	return es_panel_analytics_overview(inputs)
});