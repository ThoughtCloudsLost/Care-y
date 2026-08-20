/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Nav_LabelInputs */

const en_demo_section_nav_label = /** @type {(inputs: Demo_Section_Nav_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Handbook sections`)
};

const es_demo_section_nav_label = /** @type {(inputs: Demo_Section_Nav_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Secciones del manual`)
};

/**
* | output |
* | --- |
* | "Handbook sections" |
*
* @param {Demo_Section_Nav_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_nav_label = /** @type {((inputs?: Demo_Section_Nav_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Nav_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_nav_label(inputs)
	return es_demo_section_nav_label(inputs)
});