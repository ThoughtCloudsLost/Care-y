/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_Group_AnalyticsInputs */

const en_panel_group_analytics = /** @type {(inputs: Panel_Group_AnalyticsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Analytics`)
};

const es_panel_group_analytics = /** @type {(inputs: Panel_Group_AnalyticsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Analiticas`)
};

/**
* | output |
* | --- |
* | "Analytics" |
*
* @param {Panel_Group_AnalyticsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_group_analytics = /** @type {((inputs?: Panel_Group_AnalyticsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_Group_AnalyticsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_group_analytics(inputs)
	return es_panel_group_analytics(inputs)
});