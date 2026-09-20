/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_Group_AnalyticsInputs */

const en_panel_group_analytics = /** @type {(inputs: Panel_Group_AnalyticsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Analytics`)
};

const es_panel_group_analytics = /** @type {(inputs: Panel_Group_AnalyticsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Analíticas`)
};

const en_xa2_panel_group_analytics = /** @type {(inputs: Panel_Group_AnalyticsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ànàlytìcs •••⟧`)
};

/**
* | output |
* | --- |
* | "Analytics" |
*
* @param {Panel_Group_AnalyticsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_group_analytics = /** @type {((inputs?: Panel_Group_AnalyticsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_Group_AnalyticsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_panel_group_analytics(inputs)
	if (locale === "en-XA") return en_xa2_panel_group_analytics(inputs)
	return en_panel_group_analytics(inputs)
});