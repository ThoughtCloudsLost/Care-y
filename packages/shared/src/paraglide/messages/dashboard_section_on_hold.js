/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Section_On_HoldInputs */

const en_dashboard_section_on_hold = /** @type {(inputs: Dashboard_Section_On_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`On Hold`)
};

const es_dashboard_section_on_hold = /** @type {(inputs: Dashboard_Section_On_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`En espera`)
};

/**
* | output |
* | --- |
* | "On Hold" |
*
* @param {Dashboard_Section_On_HoldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_section_on_hold = /** @type {((inputs?: Dashboard_Section_On_HoldInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Section_On_HoldInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_section_on_hold(inputs)
	return es_dashboard_section_on_hold(inputs)
});