/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Section_UrgentInputs */

const en_dashboard_section_urgent = /** @type {(inputs: Dashboard_Section_UrgentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Urgent`)
};

const es_dashboard_section_urgent = /** @type {(inputs: Dashboard_Section_UrgentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Urgente`)
};

/**
* | output |
* | --- |
* | "Urgent" |
*
* @param {Dashboard_Section_UrgentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_section_urgent = /** @type {((inputs?: Dashboard_Section_UrgentInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Section_UrgentInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_section_urgent(inputs)
	return es_dashboard_section_urgent(inputs)
});