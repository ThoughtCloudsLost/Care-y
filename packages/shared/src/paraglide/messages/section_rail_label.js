/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Section_Rail_LabelInputs */

const en_section_rail_label = /** @type {(inputs: Section_Rail_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Page sections`)
};

const es_section_rail_label = /** @type {(inputs: Section_Rail_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Secciones de la página`)
};

/**
* | output |
* | --- |
* | "Page sections" |
*
* @param {Section_Rail_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const section_rail_label = /** @type {((inputs?: Section_Rail_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Section_Rail_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_section_rail_label(inputs)
	return es_section_rail_label(inputs)
});