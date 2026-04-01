/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Empty_SectionInputs */

const en_dashboard_empty_section = /** @type {(inputs: Dashboard_Empty_SectionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nothing here right now`)
};

const es_dashboard_empty_section = /** @type {(inputs: Dashboard_Empty_SectionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nada aqui ahora mismo`)
};

/**
* | output |
* | --- |
* | "Nothing here right now" |
*
* @param {Dashboard_Empty_SectionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_empty_section = /** @type {((inputs?: Dashboard_Empty_SectionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Empty_SectionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_empty_section(inputs)
	return es_dashboard_empty_section(inputs)
});