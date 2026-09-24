/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Empty_SectionInputs */

const en_dashboard_empty_section = /** @type {(inputs: Dashboard_Empty_SectionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nothing here right now`)
};

const es_dashboard_empty_section = /** @type {(inputs: Dashboard_Empty_SectionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nada aquí ahora mismo`)
};

const en_xa2_dashboard_empty_section = /** @type {(inputs: Dashboard_Empty_SectionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòthìng hèrè rìght nòw •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Nothing here right now" |
*
* @param {Dashboard_Empty_SectionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_empty_section = /** @type {((inputs?: Dashboard_Empty_SectionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Empty_SectionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_empty_section(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_empty_section(inputs)
	return en_dashboard_empty_section(inputs)
});