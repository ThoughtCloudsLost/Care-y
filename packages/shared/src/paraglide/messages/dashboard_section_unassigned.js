/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Section_UnassignedInputs */

const en_dashboard_section_unassigned = /** @type {(inputs: Dashboard_Section_UnassignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unassigned`)
};

const es_dashboard_section_unassigned = /** @type {(inputs: Dashboard_Section_UnassignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin asignar`)
};

const en_xa2_dashboard_section_unassigned = /** @type {(inputs: Dashboard_Section_UnassignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnàssìgnèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Unassigned" |
*
* @param {Dashboard_Section_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_section_unassigned = /** @type {((inputs?: Dashboard_Section_UnassignedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Section_UnassignedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_section_unassigned(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_section_unassigned(inputs)
	return en_dashboard_section_unassigned(inputs)
});