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

const en_xa2_demo_section_nav_label = /** @type {(inputs: Demo_Section_Nav_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hàndbòòk sèctìòns ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Handbook sections" |
*
* @param {Demo_Section_Nav_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_nav_label = /** @type {((inputs?: Demo_Section_Nav_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Nav_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_nav_label(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_nav_label(inputs)
	return en_demo_section_nav_label(inputs)
});