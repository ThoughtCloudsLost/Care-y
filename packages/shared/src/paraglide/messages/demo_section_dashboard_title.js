/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Dashboard_TitleInputs */

const en_demo_section_dashboard_title = /** @type {(inputs: Demo_Section_Dashboard_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Overview`)
};

const es_demo_section_dashboard_title = /** @type {(inputs: Demo_Section_Dashboard_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resumen`)
};

/**
* | output |
* | --- |
* | "Overview" |
*
* @param {Demo_Section_Dashboard_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_dashboard_title = /** @type {((inputs?: Demo_Section_Dashboard_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Dashboard_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_dashboard_title(inputs)
	return es_demo_section_dashboard_title(inputs)
});