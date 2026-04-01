/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Section_UnassignedInputs */

const en_dashboard_section_unassigned = /** @type {(inputs: Dashboard_Section_UnassignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Needs Attention`)
};

const es_dashboard_section_unassigned = /** @type {(inputs: Dashboard_Section_UnassignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Necesita atencion`)
};

/**
* | output |
* | --- |
* | "Needs Attention" |
*
* @param {Dashboard_Section_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_section_unassigned = /** @type {((inputs?: Dashboard_Section_UnassignedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Section_UnassignedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_section_unassigned(inputs)
	return es_dashboard_section_unassigned(inputs)
});