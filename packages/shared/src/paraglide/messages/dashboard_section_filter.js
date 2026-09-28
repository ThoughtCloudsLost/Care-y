/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ section: NonNullable<unknown> }} Dashboard_Section_FilterInputs */

const en_dashboard_section_filter = /** @type {(inputs: Dashboard_Section_FilterInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Filter ${i?.section}`)
};

const es_dashboard_section_filter = /** @type {(inputs: Dashboard_Section_FilterInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Filtrar ${i?.section}`)
};

const en_xa2_dashboard_section_filter = /** @type {(inputs: Dashboard_Section_FilterInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Fìltèr  •••${i?.section}⟧`)
};

/**
* | output |
* | --- |
* | "Filter {section}" |
*
* @param {Dashboard_Section_FilterInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_section_filter = /** @type {((inputs: Dashboard_Section_FilterInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Section_FilterInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_section_filter(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_section_filter(inputs)
	return en_dashboard_section_filter(inputs)
});