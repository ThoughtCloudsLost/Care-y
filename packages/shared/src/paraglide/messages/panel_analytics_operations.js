/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_Analytics_OperationsInputs */

const en_panel_analytics_operations = /** @type {(inputs: Panel_Analytics_OperationsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Operations`)
};

const es_panel_analytics_operations = /** @type {(inputs: Panel_Analytics_OperationsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Operaciones`)
};

/**
* | output |
* | --- |
* | "Operations" |
*
* @param {Panel_Analytics_OperationsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_analytics_operations = /** @type {((inputs?: Panel_Analytics_OperationsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_Analytics_OperationsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_analytics_operations(inputs)
	return es_panel_analytics_operations(inputs)
});